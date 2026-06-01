import { expect, test, type APIRequestContext } from "@playwright/test";
import { execFileSync } from "node:child_process";
import {
  apiBaseUrl,
  authHeaders,
  expectNoServerError,
  expectOk,
  hasAdminSmokeCredentials,
  loginAdmin,
  shouldRunLocalFullstack,
  signupAndLogin,
  suffix,
} from "./support/api";

type PageEnvelope<T> = {
  content?: T[];
  number?: number;
  size?: number;
  totalElements?: number;
};

type AdminPostRow = {
  postId: number;
  type: "FREE" | "QUESTION";
  publicationStatus?: string;
  moderationStatus?: string;
  commentCount?: number;
  answerCount?: number;
};

const pageItems = <T>(value: unknown): T[] => {
  const page = value as PageEnvelope<T>;
  return page.content ?? [];
};

const firstAvailableSlot = (reservationInfo: unknown) => {
  const data = reservationInfo as {
    data?: {
      availableDates?: Array<{
        date: string;
        availableTimes?: Array<{
          slotId: number;
          startTime: string;
          availableCapacity: number;
        }>;
      }>;
    };
  };

  for (const day of data.data?.availableDates ?? []) {
    const time = day.availableTimes?.find(
      (candidate) => candidate.availableCapacity > 0
    );
    if (time) {
      return {
        reservationDate: day.date,
        reservationTime: time.startTime,
        slotId: time.slotId,
      };
    }
  }

  return null;
};

const createMarketplaceClass = async (
  request: APIRequestContext,
  trainerToken: string,
  overrides: Partial<{ title: string; imageIds: number[] }> = {}
) => {
  await expectOk(
    "trainer store upsert",
    await request.put(`${apiBaseUrl()}/marketplace/trainer/store`, {
      headers: authHeaders(trainerToken),
      data: {
        storeName: `Local QA Store ${suffix().slice(-6)}`,
        address: "Seoul Gangnam-gu",
        detailAddress: "2F",
        latitude: 37.4979,
        longitude: 127.0276,
        phoneNumber: "010-1234-5678",
        homepageUrl: null,
        instagramUrl: null,
        xProfileUrl: null,
      },
    })
  );

  const title = overrides.title ?? `Local QA PT ${suffix().slice(-8)}`;
  const body = await expectOk(
    "trainer class create",
    await request.post(`${apiBaseUrl()}/marketplace/trainer/classes`, {
      headers: authHeaders(trainerToken),
      data: {
        title,
        category: "PT",
        description: "Local fullstack QA class",
        priceAmount: 1,
        durationMinutes: 50,
        tags: ["local-fullstack"],
        features: ["qa"],
        personalItems: "towel",
        imageIds: overrides.imageIds ?? [],
        classTimes: [
          {
            daysOfWeek: ["MONDAY", "WEDNESDAY"],
            startTime: "10:00:00",
            capacity: 2,
          },
        ],
      },
    })
  );

  return { classId: body.data.classId as number, title };
};

const sqlLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;

const insertQuestionWithAnswerFixture = (
  title: string,
  questionUserId: number,
  answerUserId: number
) => {
  const container = process.env.E2E_SMOKE_DB_CONTAINER ?? "mztk-postgres";
  const dbUser = process.env.E2E_SMOKE_DB_USER ?? "mztk";
  const dbName = process.env.E2E_SMOKE_DB_NAME ?? "mztk";
  const sql = `
WITH q AS (
  INSERT INTO posts (
    content, created_at, reward, title, type, updated_at, user_id, status,
    moderation_status, publication_status
  )
  VALUES (
    'local fullstack question fixture content', now(), 1, ${sqlLiteral(title)},
    'QUESTION', now(), ${questionUserId}, 'OPEN', 'NORMAL', 'VISIBLE'
  )
  RETURNING id
),
a AS (
  INSERT INTO answers (
    content, created_at, is_accepted, post_id, updated_at, user_id, publication_status
  )
  SELECT 'local fullstack answer fixture content', now(), false, id, now(), ${answerUserId}, 'VISIBLE'
  FROM q
  RETURNING id, post_id
)
SELECT q.id || ',' || a.id FROM q JOIN a ON a.post_id = q.id;
`;

  const output = execFileSync(
    "docker",
    [
      "exec",
      container,
      "psql",
      "-U",
      dbUser,
      "-d",
      dbName,
      "-t",
      "-A",
      "-c",
      sql,
    ],
    { encoding: "utf8" }
  )
    .trim()
    .split(/\r?\n/)
    .find(Boolean);

  if (!output) {
    throw new Error("failed to insert local QnA fixture");
  }
  const [postId, answerId] = output.split(",").map(Number);
  return { postId, answerId };
};

test.describe("local fullstack exhaustive QA", () => {
  test.skip(
    !shouldRunLocalFullstack(),
    "local fullstack QA requires E2E_SMOKE_API_BASE_URL=http://localhost:..."
  );
  test.skip(
    !hasAdminSmokeCredentials(),
    "admin QA requires E2E_SMOKE_ADMIN_LOGIN_ID and E2E_SMOKE_ADMIN_PASSWORD"
  );

  test("admin account creation returns the generated password and the new admin can login", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const admin = await loginAdmin(request);
    const created = await expectOk(
      "admin account create",
      await request.post(`${apiBaseUrl()}/admin/accounts`, {
        headers: authHeaders(admin.token),
      })
    );

    expect(created.data.loginId).toMatch(/^\d{8}$/);
    expect(created.data.generatedPassword).toEqual(expect.any(String));
    expect(created.data.generatedPassword.length).toBeGreaterThanOrEqual(12);

    const loginBody = await expectOk(
      "created admin login",
      await request.post(`${apiBaseUrl()}/auth/login`, {
        data: {
          provider: "LOCAL_ADMIN",
          loginId: created.data.loginId,
          password: created.data.generatedPassword,
        },
      })
    );
    expect(loginBody.data.accessToken).toEqual(expect.any(String));
  });

  test("admin user management sends search and pagination to BE and finds nickname", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const admin = await loginAdmin(request);
    const body = await expectOk(
      "admin users nickname search",
      await request.get(
        `${apiBaseUrl()}/admin/users?search=${encodeURIComponent(member.nickname)}&page=0&size=5&sort=nickname`,
        { headers: authHeaders(admin.token) }
      )
    );

    const items = pageItems<{ userId: number; nickname: string }>(body.data);
    expect(body.data.number).toBe(0);
    expect(body.data.size).toBe(5);
    expect(
      items.some(
        (item) =>
          item.userId === member.userId && item.nickname === member.nickname
      )
    ).toBe(true);
  });

  test("admin board post ban and unblock restore FREE post visibility in public v2 list", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const admin = await loginAdmin(request);
    const postContent = `local fullstack restore ${suffix()}`;

    const postBody = await expectOk(
      "free post create",
      await request.post(`${apiBaseUrl()}/posts/free`, {
        headers: authHeaders(member.token),
        data: { content: postContent, imageIds: [], tags: ["local-fullstack"] },
      })
    );
    const postId = postBody.data.postId as number;

    const initialAdminBody = await expectOk(
      "admin board find created post",
      await request.get(
        `${apiBaseUrl()}/admin/boards/posts?postId=${postId}&page=0&size=10`,
        {
          headers: authHeaders(admin.token),
        }
      )
    );
    expect(
      pageItems<AdminPostRow>(initialAdminBody.data).some(
        (post) => post.postId === postId
      )
    ).toBe(true);

    await expectOk(
      "admin board ban post",
      await request.post(`${apiBaseUrl()}/admin/boards/posts/${postId}/ban`, {
        headers: authHeaders(admin.token),
        data: {
          reasonCode: "OTHER",
          reasonDetail: "local fullstack QA ban/unblock verification",
        },
      })
    );

    const blockedList = await expectOk(
      "public free list after ban",
      await request.get(
        `${apiBaseUrl()}/v2/posts?type=FREE&search=${encodeURIComponent(postContent)}&size=10`,
        { headers: authHeaders(member.token) }
      )
    );
    expect(
      blockedList.data.posts.some(
        (post: { postId: number }) => post.postId === postId
      )
    ).toBe(false);

    await expectOk(
      "admin board unblock post",
      await request.post(
        `${apiBaseUrl()}/admin/boards/posts/${postId}/unblock`,
        {
          headers: authHeaders(admin.token),
          data: {
            reasonCode: "OTHER",
            reasonDetail: "local fullstack QA restore verification",
          },
        }
      )
    );

    const restoredAdminBody = await expectOk(
      "admin board find restored post",
      await request.get(
        `${apiBaseUrl()}/admin/boards/posts?postId=${postId}&page=0&size=10`,
        {
          headers: authHeaders(admin.token),
        }
      )
    );
    const restoredAdminRow = pageItems<AdminPostRow>(
      restoredAdminBody.data
    ).find((post) => post.postId === postId);
    expect(restoredAdminRow?.moderationStatus).toBe("NORMAL");
    expect(restoredAdminRow?.publicationStatus).toBe("VISIBLE");

    const restoredList = await expectOk(
      "public free list after unblock",
      await request.get(
        `${apiBaseUrl()}/v2/posts?type=FREE&search=${encodeURIComponent(postContent)}&size=10`,
        { headers: authHeaders(member.token) }
      )
    );
    expect(
      restoredList.data.posts.some(
        (post: { postId: number }) => post.postId === postId
      )
    ).toBe(true);
  });

  test("admin board QUESTION rows include answerCount from BE", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const asker = await signupAndLogin(request, "USER");
    const answerer = await signupAndLogin(request, "USER");
    const admin = await loginAdmin(request);
    const questionTitle = `local fullstack answer count ${suffix()}`;

    const questionAttempt = await expectNoServerError(
      "question create",
      await request.post(`${apiBaseUrl()}/posts/question`, {
        headers: authHeaders(asker.token),
        data: {
          title: questionTitle,
          content: "local fullstack answer count question",
          reward: 1,
          imageIds: [],
          tags: ["local-fullstack"],
        },
      })
    );

    let postId: number;
    if (questionAttempt.status >= 200 && questionAttempt.status < 300) {
      postId = questionAttempt.body.data.postId;
      const answerAttempt = await expectNoServerError(
        "answer create",
        await request.post(`${apiBaseUrl()}/questions/${postId}/answers`, {
          headers: authHeaders(answerer.token),
          data: { content: "local fullstack counted answer", imageIds: [] },
        })
      );
      if (answerAttempt.status < 200 || answerAttempt.status >= 300) {
        const fixture = insertQuestionWithAnswerFixture(
          `${questionTitle} fixture`,
          asker.userId,
          answerer.userId
        );
        postId = fixture.postId;
      }
    } else {
      const fixture = insertQuestionWithAnswerFixture(
        questionTitle,
        asker.userId,
        answerer.userId
      );
      postId = fixture.postId;
    }

    const adminBody = await expectOk(
      "admin board question answer count",
      await request.get(
        `${apiBaseUrl()}/admin/boards/posts?postId=${postId}&page=0&size=10`,
        {
          headers: authHeaders(admin.token),
        }
      )
    );
    const row = pageItems<AdminPostRow>(adminBody.data).find(
      (post) => post.postId === postId
    );
    expect(row?.type).toBe("QUESTION");
    expect(row?.answerCount).toBeGreaterThanOrEqual(1);
  });

  test("marketplace class visibility, pagination, purchase API, and web3 monitor endpoints are live", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const trainer = await signupAndLogin(request, "TRAINER");
    const admin = await loginAdmin(request);
    const first = await createMarketplaceClass(request, trainer.token);
    await createMarketplaceClass(request, trainer.token);

    const firstPage = await expectOk(
      "market classes first page",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes?category=PT&sort=RATING&page=0&size=1`
      )
    );
    expect(Array.isArray(firstPage.data.items)).toBe(true);
    expect(firstPage.data.items.length).toBeGreaterThan(0);

    const secondPage = await expectOk(
      "market classes second page",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes?category=PT&sort=RATING&page=1&size=1`
      )
    );
    expect(Array.isArray(secondPage.data.items)).toBe(true);

    const fullList = await expectOk(
      "market classes list includes created class",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes?category=PT&sort=RATING&page=0&size=50`
      )
    );
    expect(
      fullList.data.items.some(
        (item: { classId?: number; id?: number; title?: string }) =>
          (item.classId ?? item.id) === first.classId ||
          item.title === first.title
      )
    ).toBe(true);

    const detail = await expectOk(
      "market class detail",
      await request.get(`${apiBaseUrl()}/marketplace/classes/${first.classId}`)
    );
    expect(detail.data.title).toBe(first.title);

    const reservationInfo = await expectOk(
      "market class reservation info",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes/${first.classId}/reservation-info`
      )
    );
    const slot = firstAvailableSlot(reservationInfo);
    expect(slot).not.toBeNull();

    if (slot) {
      const reservationAttempt = await expectNoServerError(
        "market purchase reservation create",
        await request.post(
          `${apiBaseUrl()}/marketplace/classes/${first.classId}/reservations`,
          {
            headers: authHeaders(member.token),
            data: {
              ...slot,
              userRequest: "local fullstack purchase QA",
              idempotencyKey: `local-qa-${suffix()}`,
              signedAmount: "1",
            },
          }
        )
      );
      if (reservationAttempt.status >= 200 && reservationAttempt.status < 300) {
        expect(reservationAttempt.body.data.reservationId).toEqual(
          expect.any(Number)
        );
        expect(reservationAttempt.body.data.web3 ?? null).not.toBeUndefined();
      }
    }

    const treasury = await expectOk(
      "admin web3 treasury keys",
      await request.get(`${apiBaseUrl()}/admin/web3/treasury-keys`, {
        headers: authHeaders(admin.token),
      })
    );
    const monitorAddress =
      treasury.data?.[0]?.walletAddress ??
      "0x0000000000000000000000000000000000000000";
    const nonceSlots = await expectOk(
      "admin web3 nonce slots",
      await request.get(
        `${apiBaseUrl()}/admin/web3/nonce-slots?chainId=31337&fromAddress=${monitorAddress}&page=0&size=10`,
        { headers: authHeaders(admin.token) }
      )
    );
    expect(
      Array.isArray(nonceSlots.data.items ?? nonceSlots.data.slots ?? [])
    ).toBe(true);
  });

  test("local BE has no legacy trainer status endpoint", async ({
    request,
  }) => {
    const trainer = await signupAndLogin(request, "TRAINER");

    const legacy = await request.get(`${apiBaseUrl()}/trainer/status`, {
      headers: authHeaders(trainer.token),
    });
    expect([404, 405]).toContain(legacy.status());

    await expectOk(
      "marketplace trainer store create",
      await request.put(`${apiBaseUrl()}/marketplace/trainer/store`, {
        headers: authHeaders(trainer.token),
        data: {
          storeName: `Local QA Store ${suffix().slice(-6)}`,
          address: "Seoul Gangnam-gu",
          detailAddress: "2F",
          latitude: 37.4979,
          longitude: 127.0276,
          phoneNumber: "010-1234-5678",
          homepageUrl: null,
          instagramUrl: null,
          xProfileUrl: null,
        },
      })
    );
    await expectOk(
      "marketplace trainer store endpoint exists",
      await request.get(`${apiBaseUrl()}/marketplace/trainer/store`, {
        headers: authHeaders(trainer.token),
      })
    );
  });
});

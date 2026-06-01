import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";

type AuthSession = {
  token: string;
  userId: number;
  email: string;
  password: string;
};

const apiBaseUrl = () => {
  const value = process.env.E2E_SMOKE_API_BASE_URL;
  if (!value) throw new Error("E2E_SMOKE_API_BASE_URL is required");
  return value.replace(/\/$/, "");
};

const suffix = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const readJson = async (response: APIResponse) => {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

const expectOk = async (name: string, response: APIResponse) => {
  const body = await readJson(response);
  expect(
    response.status(),
    `${name} failed: ${JSON.stringify(body)}`
  ).toBeGreaterThanOrEqual(200);
  expect(
    response.status(),
    `${name} failed: ${JSON.stringify(body)}`
  ).toBeLessThan(300);
  if (body?.status) expect(body.status, `${name} status`).toBe("SUCCESS");
  return body;
};

const expectNoServerError = async (name: string, response: APIResponse) => {
  const body = await readJson(response);
  expect(
    response.status(),
    `${name} server error: ${JSON.stringify(body)}`
  ).toBeLessThan(500);
  return { status: response.status(), body };
};

const signupAndLogin = async (
  request: APIRequestContext,
  role: "USER" | "TRAINER"
): Promise<AuthSession> => {
  const id = suffix();
  const email = `local-api-${role.toLowerCase()}-${id}@mztk.local`;
  const password = "LocalFullstack123!";

  await expectOk(
    `${role} signup`,
    await request.post(`${apiBaseUrl()}/auth/signup`, {
      data: {
        email,
        password,
        nickname: `api${id.slice(-8)}`,
        role,
      },
    })
  );

  const loginBody = await expectOk(
    `${role} login`,
    await request.post(`${apiBaseUrl()}/auth/login`, {
      data: {
        provider: "LOCAL",
        email,
        password,
      },
    })
  );

  return {
    token: loginBody.data.accessToken,
    userId: loginBody.data.userInfo.userId,
    email,
    password,
  };
};

const getFirstAvailableReservationSlot = (reservationInfo: unknown) => {
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

  for (const availableDate of data.data?.availableDates ?? []) {
    const availableTime = availableDate.availableTimes?.find(
      (time) => time.availableCapacity > 0
    );
    if (availableTime) {
      return {
        reservationDate: availableDate.date,
        reservationTime: availableTime.startTime,
        slotId: availableTime.slotId,
      };
    }
  }

  return null;
};

test.describe("local fullstack API smoke", () => {
  test.skip(
    !process.env.E2E_SMOKE_API_BASE_URL?.startsWith("http://localhost"),
    "local fullstack API smoke requires E2E_SMOKE_API_BASE_URL=http://localhost:..."
  );

  test("safe USER and TRAINER API services work against local BE and DB", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const trainer = await signupAndLogin(request, "TRAINER");

    await expectOk(
      "auth reissue",
      await request.post(`${apiBaseUrl()}/auth/reissue`)
    );
    await expectOk(
      "member stepup",
      await request.post(`${apiBaseUrl()}/auth/stepup`, {
        headers: authHeaders(member.token),
        data: { password: member.password },
      })
    );

    await expectOk(
      "member profile",
      await request.get(`${apiBaseUrl()}/users/me`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "leaderboard",
      await request.get(`${apiBaseUrl()}/users/leaderboard`)
    );

    await expectOk(
      "level policies",
      await request.get(`${apiBaseUrl()}/levels/policies`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "member level",
      await request.get(`${apiBaseUrl()}/users/me/level`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "attendance status",
      await request.get(`${apiBaseUrl()}/users/me/attendance/status`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "attendance weekly",
      await request.get(`${apiBaseUrl()}/users/me/attendance/weekly`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "attendance check-in",
      await request.post(`${apiBaseUrl()}/users/me/attendance`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "level histories",
      await request.get(
        `${apiBaseUrl()}/users/me/level-up-histories?page=0&size=5`,
        {
          headers: authHeaders(member.token),
        }
      )
    );
    await expectOk(
      "xp ledger",
      await request.get(`${apiBaseUrl()}/users/me/xp-ledger?page=0&size=5`, {
        headers: authHeaders(member.token),
      })
    );

    const locationBody = await expectOk(
      "location register",
      await request.post(`${apiBaseUrl()}/users/me/locations/register`, {
        headers: authHeaders(member.token),
        data: {
          locationName: "Local API Gym",
          postalCode: "06000",
          address: "Seoul Gangnam-gu",
          detailAddress: "1F",
          latitude: 37.4979,
          longitude: 127.0276,
        },
      })
    );
    const locationId = locationBody.data.locationId;
    await expectOk(
      "locations list",
      await request.get(`${apiBaseUrl()}/users/me/locations`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "location verify",
      await request.post(`${apiBaseUrl()}/locations/verify`, {
        headers: authHeaders(member.token),
        data: {
          locationId,
          currentLatitude: 37.4979,
          currentLongitude: 127.0276,
        },
      })
    );

    const presignBody = await expectOk(
      "image presigned urls",
      await request.post(`${apiBaseUrl()}/images/presigned-urls`, {
        headers: authHeaders(member.token),
        data: {
          referenceType: "COMMUNITY_FREE",
          images: [`local-api-${suffix()}.png`],
        },
      })
    );
    const imageId = presignBody.data.items[0].imageId;
    await expectOk(
      "image status",
      await request.get(`${apiBaseUrl()}/images/status?ids=${imageId}`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "workout today completion",
      await request.get(`${apiBaseUrl()}/verification/today-completion`, {
        headers: authHeaders(member.token),
      })
    );
    const workoutBody = await expectNoServerError(
      "workout record submit",
      await request.post(`${apiBaseUrl()}/verification/record`, {
        headers: authHeaders(member.token),
        data: { tmpObjectKey: presignBody.data.items[0].tmpObjectKey },
      })
    );
    if (workoutBody.status >= 200 && workoutBody.status < 300) {
      await expectOk(
        "workout detail",
        await request.get(
          `${apiBaseUrl()}/verification/${workoutBody.body.data.verificationId}`,
          { headers: authHeaders(member.token) }
        )
      );
    }

    const postBody = await expectOk(
      "free post create",
      await request.post(`${apiBaseUrl()}/posts/free`, {
        headers: authHeaders(member.token),
        data: {
          content: `local fullstack free post ${suffix()}`,
          imageIds: [],
          tags: [],
        },
      })
    );
    const postId = postBody.data.postId;
    await expectOk(
      "posts list",
      await request.get(`${apiBaseUrl()}/posts?type=FREE&size=10`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "post detail",
      await request.get(`${apiBaseUrl()}/posts/${postId}`)
    );
    await expectOk(
      "posts v2 list",
      await request.get(`${apiBaseUrl()}/v2/posts?type=FREE&size=10`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "my posts v2",
      await request.get(`${apiBaseUrl()}/v2/users/me/posts?type=FREE&size=10`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "liked posts v2",
      await request.get(
        `${apiBaseUrl()}/v2/users/me/liked-posts?type=FREE&size=10`,
        {
          headers: authHeaders(member.token),
        }
      )
    );
    await expectOk(
      "commented posts v2",
      await request.get(
        `${apiBaseUrl()}/v2/users/me/commented-posts?type=FREE&size=10`,
        {
          headers: authHeaders(member.token),
        }
      )
    );
    await expectOk(
      "post like",
      await request.post(`${apiBaseUrl()}/posts/${postId}/likes`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "post unlike",
      await request.delete(`${apiBaseUrl()}/posts/${postId}/likes`, {
        headers: authHeaders(member.token),
      })
    );
    const commentBody = await expectOk(
      "post comment create",
      await request.post(`${apiBaseUrl()}/posts/${postId}/comments`, {
        headers: authHeaders(member.token),
        data: { content: "local api comment", parentId: null },
      })
    );
    const commentId = commentBody.data.commentId;
    await expectOk(
      "post comments list",
      await request.get(`${apiBaseUrl()}/posts/${postId}/comments`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "comment replies",
      await request.get(`${apiBaseUrl()}/comments/${commentId}/replies`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "comment update",
      await request.put(`${apiBaseUrl()}/comments/${commentId}`, {
        headers: authHeaders(member.token),
        data: { content: "local api comment updated" },
      })
    );
    await expectOk(
      "comments v2 list",
      await request.get(`${apiBaseUrl()}/v2/posts/${postId}/comments?size=10`, {
        headers: authHeaders(member.token),
      })
    );

    await expectOk(
      "trainer store upsert",
      await request.put(`${apiBaseUrl()}/marketplace/trainer/store`, {
        headers: authHeaders(trainer.token),
        data: {
          storeName: `Local API Store ${suffix().slice(-6)}`,
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
      "trainer store get",
      await request.get(`${apiBaseUrl()}/marketplace/trainer/store`, {
        headers: authHeaders(trainer.token),
      })
    );

    const classRequest = {
      title: `Local API PT ${suffix().slice(-8)}`,
      category: "PT",
      description: "Local fullstack API class",
      priceAmount: 1,
      durationMinutes: 50,
      tags: [],
      features: ["fullstack"],
      personalItems: "towel",
      imageIds: [],
      classTimes: [
        {
          daysOfWeek: ["MONDAY"],
          startTime: "10:00:00",
          capacity: 2,
        },
      ],
    };

    const classBody = await expectOk(
      "trainer class create",
      await request.post(`${apiBaseUrl()}/marketplace/trainer/classes`, {
        headers: authHeaders(trainer.token),
        data: classRequest,
      })
    );
    const classId = classBody.data.classId;
    await expectOk(
      "trainer classes list",
      await request.get(`${apiBaseUrl()}/marketplace/trainer/classes?page=0`, {
        headers: authHeaders(trainer.token),
      })
    );
    await expectOk(
      "market classes list",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes?category=PT&sort=RATING&page=0`
      )
    );
    await expectOk(
      "market class detail",
      await request.get(`${apiBaseUrl()}/marketplace/classes/${classId}`)
    );
    const reservationInfoBody = await expectOk(
      "market class reservation info",
      await request.get(
        `${apiBaseUrl()}/marketplace/classes/${classId}/reservation-info`
      )
    );

    await expectOk(
      "trainer class update",
      await request.put(
        `${apiBaseUrl()}/marketplace/trainer/classes/${classId}`,
        {
          headers: authHeaders(trainer.token),
          data: {
            ...classRequest,
            title: `${classRequest.title} updated`,
            classTimes: classRequest.classTimes.map((time) => ({
              timeId: null,
              ...time,
            })),
          },
        }
      )
    );
    await expectOk(
      "trainer class status toggle",
      await request.patch(
        `${apiBaseUrl()}/marketplace/trainer/classes/${classId}/status`,
        {
          headers: authHeaders(trainer.token),
        }
      )
    );

    await expectOk(
      "member reservations list",
      await request.get(`${apiBaseUrl()}/marketplace/me/reservations?size=10`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "trainer reservations list",
      await request.get(
        `${apiBaseUrl()}/marketplace/trainer/reservations?size=10`,
        {
          headers: authHeaders(trainer.token),
        }
      )
    );

    const slot = getFirstAvailableReservationSlot(reservationInfoBody);
    if (slot) {
      const reservationAttempt = await expectNoServerError(
        "reservation create",
        await request.post(
          `${apiBaseUrl()}/marketplace/classes/${classId}/reservations`,
          {
            headers: authHeaders(member.token),
            data: {
              ...slot,
              userRequest: "local fullstack reservation",
              idempotencyKey: `local-api-${suffix()}`,
              signedAmount: "1",
            },
          }
        )
      );

      if (reservationAttempt.status >= 200 && reservationAttempt.status < 300) {
        const reservationId = reservationAttempt.body.data.reservationId;
        await expectOk(
          "member reservation detail",
          await request.get(
            `${apiBaseUrl()}/marketplace/reservations/${reservationId}`,
            {
              headers: authHeaders(member.token),
            }
          )
        );
        await expectOk(
          "trainer reservation detail",
          await request.get(
            `${apiBaseUrl()}/marketplace/trainer/reservations/${reservationId}`,
            { headers: authHeaders(trainer.token) }
          )
        );
      }
    }

    await expectOk(
      "web3 challenge",
      await request.post(`${apiBaseUrl()}/web3/challenges`, {
        headers: authHeaders(member.token),
        data: {
          purpose: "WALLET_REGISTRATION",
          walletAddress: "0x0000000000000000000000000000000000000001",
        },
      })
    );
    await expectNoServerError(
      "transfer create precondition",
      await request.post(`${apiBaseUrl()}/users/me/transfers`, {
        headers: authHeaders(member.token),
        data: {
          toUserId: trainer.userId,
          clientRequestId: `local-api-${suffix()}`,
          amountWei: "1",
        },
      })
    );

    const adminUsersAsMember = await request.get(
      `${apiBaseUrl()}/admin/users`,
      {
        headers: authHeaders(member.token),
      }
    );
    expect([401, 403]).toContain(adminUsersAsMember.status());
  });
});

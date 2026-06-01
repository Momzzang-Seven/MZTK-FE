import { expect, test } from "@playwright/test";
import {
  apiBaseUrl,
  authHeaders,
  expectOk,
  hasAdminSmokeCredentials,
  loginAdmin,
  shouldRunLocalFullstack,
} from "./support/api";

const optionalNumberEnv = (name: string) => {
  const value = process.env[name];
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

test.describe("local fullstack admin API smoke", () => {
  test.skip(
    !shouldRunLocalFullstack(),
    "local fullstack admin smoke requires E2E_SMOKE_API_BASE_URL=http://localhost:..."
  );
  test.skip(
    !hasAdminSmokeCredentials(),
    "admin smoke requires E2E_SMOKE_ADMIN_LOGIN_ID and E2E_SMOKE_ADMIN_PASSWORD"
  );

  test("admin read-only APIs return successful BE envelopes", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const admin = await loginAdmin(request);
    const headers = authHeaders(admin.token);

    await expectOk(
      "admin dashboard user stats",
      await request.get(`${apiBaseUrl()}/admin/dashboard/user-stats`, {
        headers,
      })
    );
    await expectOk(
      "admin dashboard post stats",
      await request.get(`${apiBaseUrl()}/admin/dashboard/post-stats`, {
        headers,
      })
    );
    await expectOk(
      "admin users list",
      await request.get(`${apiBaseUrl()}/admin/users?page=0&size=10`, {
        headers,
      })
    );

    const postsBody = await expectOk(
      "admin board posts list",
      await request.get(`${apiBaseUrl()}/admin/boards/posts?page=0&size=10`, {
        headers,
      })
    );

    const firstPostId =
      postsBody.data?.items?.[0]?.postId ??
      postsBody.data?.content?.[0]?.postId;
    if (firstPostId) {
      await expectOk(
        "admin board post comments list",
        await request.get(
          `${apiBaseUrl()}/admin/boards/posts/${firstPostId}/comments?page=0&size=10`,
          { headers }
        )
      );
    } else {
      test.info().annotations.push({
        type: "fixture-empty",
        description:
          "No admin board post was available, so post comments read was skipped.",
      });
    }

    await expectOk(
      "admin accounts list",
      await request.get(`${apiBaseUrl()}/admin/accounts`, { headers })
    );
    const treasuryBody = await expectOk(
      "admin web3 treasury keys list",
      await request.get(`${apiBaseUrl()}/admin/web3/treasury-keys`, {
        headers,
      })
    );

    const firstTreasuryKey = treasuryBody.data?.[0];
    const walletAlias =
      firstTreasuryKey?.walletAlias ?? firstTreasuryKey?.alias;
    if (walletAlias) {
      await expectOk(
        "admin web3 treasury key detail",
        await request.get(
          `${apiBaseUrl()}/admin/web3/treasury-keys/${walletAlias}`,
          { headers }
        )
      );
    }
  });

  test("admin marketplace escrow review APIs are read-only and DB-backed", async ({
    request,
  }) => {
    test.setTimeout(120000);
    const reservationId = optionalNumberEnv(
      "E2E_SMOKE_MARKETPLACE_RESERVATION_ID"
    );
    test.skip(
      !reservationId,
      "set E2E_SMOKE_MARKETPLACE_RESERVATION_ID to verify marketplace escrow review"
    );

    const admin = await loginAdmin(request);
    const headers = authHeaders(admin.token);

    const refundBody = await expectOk(
      "marketplace refund review",
      await request.get(
        `${apiBaseUrl()}/admin/web3/marketplace/reservations/${reservationId}/refund-review`,
        { headers }
      )
    );
    expect(refundBody.data.reservationId).toBe(reservationId);
    expect(Array.isArray(refundBody.data.reasonOptions)).toBe(true);
    expect(Array.isArray(refundBody.data.baseValidationItems)).toBe(true);

    const settlementBody = await expectOk(
      "marketplace settlement review",
      await request.get(
        `${apiBaseUrl()}/admin/web3/marketplace/reservations/${reservationId}/settlement-review`,
        { headers }
      )
    );
    expect(settlementBody.data.reservationId).toBe(reservationId);
    expect(Array.isArray(settlementBody.data.reasonOptions)).toBe(true);
    expect(Array.isArray(settlementBody.data.baseValidationItems)).toBe(true);
  });

  test("admin qna escrow review APIs are read-only and DB-backed", async ({
    request,
  }) => {
    test.setTimeout(120000);
    const postId = optionalNumberEnv("E2E_SMOKE_QNA_POST_ID");
    const answerId = optionalNumberEnv("E2E_SMOKE_QNA_ANSWER_ID");
    test.skip(
      !postId || !answerId,
      "set E2E_SMOKE_QNA_POST_ID and E2E_SMOKE_QNA_ANSWER_ID to verify QnA escrow review"
    );

    const admin = await loginAdmin(request);
    const headers = authHeaders(admin.token);

    const refundBody = await expectOk(
      "qna refund review",
      await request.get(
        `${apiBaseUrl()}/admin/web3/qna/questions/${postId}/refund-review`,
        { headers }
      )
    );
    expect(refundBody.data.postId ?? refundBody.data.questionId).toBe(postId);

    const settlementBody = await expectOk(
      "qna settlement review",
      await request.get(
        `${apiBaseUrl()}/admin/web3/qna/questions/${postId}/answers/${answerId}/settlement-review`,
        { headers }
      )
    );
    expect(settlementBody.data.postId ?? settlementBody.data.questionId).toBe(
      postId
    );
    expect(settlementBody.data.answerId).toBe(answerId);
  });
});

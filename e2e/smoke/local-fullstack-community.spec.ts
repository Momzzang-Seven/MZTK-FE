import { expect, test } from "@playwright/test";
import {
  apiBaseUrl,
  authHeaders,
  expectNoServerError,
  expectOk,
  shouldRunLocalFullstack,
  signupAndLogin,
  suffix,
} from "./support/api";

test.describe("local fullstack community API smoke", () => {
  test.skip(
    !shouldRunLocalFullstack(),
    "local fullstack community smoke requires E2E_SMOKE_API_BASE_URL=http://localhost:..."
  );

  test("free post and v2 comments round-trip through local BE and DB", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const postContent = `local fullstack free post ${suffix()}`;

    const postBody = await expectOk(
      "free post create",
      await request.post(`${apiBaseUrl()}/posts/free`, {
        headers: authHeaders(member.token),
        data: {
          content: postContent,
          imageIds: [],
          tags: ["local-fullstack"],
        },
      })
    );
    const postId = postBody.data.postId;
    expect(postId).toBeTruthy();

    const detailBody = await expectOk(
      "post detail",
      await request.get(`${apiBaseUrl()}/posts/${postId}`, {
        headers: authHeaders(member.token),
      })
    );
    expect(detailBody.data.postId).toBe(postId);
    expect(detailBody.data.content).toContain(postContent);

    const listBody = await expectOk(
      "v2 posts list",
      await request.get(`${apiBaseUrl()}/v2/posts?type=FREE&size=10`, {
        headers: authHeaders(member.token),
      })
    );
    expect(
      listBody.data.posts.some(
        (post: { postId: number }) => post.postId === postId
      )
    ).toBe(true);

    const commentContent = `local fullstack comment ${suffix()}`;
    const commentBody = await expectOk(
      "v2 post comment create",
      await request.post(`${apiBaseUrl()}/v2/posts/${postId}/comments`, {
        headers: authHeaders(member.token),
        data: { content: commentContent },
      })
    );
    const commentId = commentBody.data.commentId;
    expect(commentId).toBeTruthy();

    const commentsBody = await expectOk(
      "v2 post comments list",
      await request.get(`${apiBaseUrl()}/v2/posts/${postId}/comments?size=10`, {
        headers: authHeaders(member.token),
      })
    );
    expect(
      commentsBody.data.comments.some(
        (comment: { commentId: number; content: string }) =>
          comment.commentId === commentId && comment.content === commentContent
      )
    ).toBe(true);

    const replyContent = `local fullstack reply ${suffix()}`;
    const replyBody = await expectOk(
      "v2 post reply create",
      await request.post(`${apiBaseUrl()}/v2/posts/${postId}/comments`, {
        headers: authHeaders(member.token),
        data: { content: replyContent, parentId: commentId },
      })
    );
    const replyId = replyBody.data.commentId;
    expect(replyId).toBeTruthy();

    const repliesBody = await expectOk(
      "v2 comment replies list",
      await request.get(
        `${apiBaseUrl()}/v2/comments/${commentId}/replies?size=10`,
        {
          headers: authHeaders(member.token),
        }
      )
    );
    expect(
      repliesBody.data.comments.some(
        (reply: { commentId?: number; replyId?: number; content: string }) =>
          (reply.commentId === replyId || reply.replyId === replyId) &&
          reply.content === replyContent
      )
    ).toBe(true);

    const updatedContent = `${commentContent} updated`;
    await expectOk(
      "comment update",
      await request.put(`${apiBaseUrl()}/comments/${commentId}`, {
        headers: authHeaders(member.token),
        data: { content: updatedContent },
      })
    );

    const updatedCommentsBody = await expectOk(
      "v2 updated post comments list",
      await request.get(`${apiBaseUrl()}/v2/posts/${postId}/comments?size=10`, {
        headers: authHeaders(member.token),
      })
    );
    expect(
      updatedCommentsBody.data.comments.some(
        (comment: { commentId: number; content: string }) =>
          comment.commentId === commentId && comment.content === updatedContent
      )
    ).toBe(true);

    await expectOk(
      "reply delete",
      await request.delete(`${apiBaseUrl()}/comments/${replyId}`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "comment delete",
      await request.delete(`${apiBaseUrl()}/comments/${commentId}`, {
        headers: authHeaders(member.token),
      })
    );
    await expectOk(
      "post delete",
      await request.delete(`${apiBaseUrl()}/posts/${postId}`, {
        headers: authHeaders(member.token),
      })
    );
  });

  test("question and answer APIs avoid server errors when Web3 prerequisites vary", async ({
    request,
  }) => {
    test.setTimeout(120000);

    const member = await signupAndLogin(request, "USER");
    const questionTitle = `local fullstack question ${suffix()}`;

    const questionAttempt = await expectNoServerError(
      "question create",
      await request.post(`${apiBaseUrl()}/posts/question`, {
        headers: authHeaders(member.token),
        data: {
          title: questionTitle,
          content: "local fullstack question content",
          reward: 1,
          imageIds: [],
          tags: ["local-fullstack"],
        },
      })
    );

    if (questionAttempt.status < 200 || questionAttempt.status >= 300) {
      test.info().annotations.push({
        type: "blocked-precondition",
        description:
          "Question creation depends on wallet/Web3 prerequisites in this local BE state.",
      });
      return;
    }

    const postId = questionAttempt.body.data.postId;
    expect(postId).toBeTruthy();

    const answerAttempt = await expectNoServerError(
      "question answer create",
      await request.post(`${apiBaseUrl()}/questions/${postId}/answers`, {
        headers: authHeaders(member.token),
        data: {
          content: "local fullstack answer content",
          imageIds: [],
          tags: [],
        },
      })
    );

    if (answerAttempt.status >= 200 && answerAttempt.status < 300) {
      const answersBody = await expectOk(
        "question answers list",
        await request.get(`${apiBaseUrl()}/questions/${postId}/answers`, {
          headers: authHeaders(member.token),
        })
      );
      expect(Array.isArray(answersBody.data)).toBe(true);
    }
  });
});

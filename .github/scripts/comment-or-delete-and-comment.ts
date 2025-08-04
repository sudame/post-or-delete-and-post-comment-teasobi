import type { context, getOctokit } from '@actions/github';

type Args = {
  github: ReturnType<typeof getOctokit>;
  context: typeof context;
};

export async function script({ github, context }: Args) {
  const pullRequestId = context.payload.pull_request?.number;
  if (pullRequestId == null) {
    return;
  }

  const comments = await github.paginate(github.rest.issues.listComments, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequestId,
  });

  const existingComment = comments.find((comment) =>
    comment.body_text?.includes('<!-- comment-id: xxxxx -->'),
  );

  if (existingComment) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existingComment.id,
    });
  }

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequestId,
    body: `<!-- comment-id: xxxxx -->
This is a new comment after deleting the previous one (${new Date().toISOString()}).`,
  });
}

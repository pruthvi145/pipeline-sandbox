// Pure function - no GitHub Actions deps - so it's unit-testable via jest.
// Status is "success" only when both deploy and the secondary check (E2E
// or mark-stable) succeed.

function compose({
  template,
  deployResult,
  secondaryResult,
  tag,
  releaseBody,
  redeploy,
}) {
  switch (template) {
    case "demo-deploy":
      return demoDeploy(
        deployResult,
        secondaryResult,
        tag,
        redeploy === true || redeploy === "true"
      );
    case "prod-promote":
      return prodPromote(
        deployResult,
        secondaryResult,
        tag,
        releaseBody,
        redeploy === true || redeploy === "true"
      );
    case "hotfix-deploy":
      return hotfixDeploy(deployResult, secondaryResult, tag);
    default:
      throw new Error(
        `Unknown compose-notification template "${template}". ` +
          `Expected: demo-deploy | prod-promote | hotfix-deploy`
      );
  }
}

function demoDeploy(deployResult, e2eResult, tag, redeploy) {
  // A redeploy re-runs the exact same tag (e.g. to pick up a changed Vercel
  // env var) and never runs E2E, so e2eResult must not be read as a failure
  // here the way it would be for a freshly-cut RC.
  if (redeploy) {
    return deployResult === "success"
      ? {
          title: `${tag} re-deployed to Demo`,
          status: "success",
          message: `Re-deployed the existing tag ${tag} to demo.totalfamily.io to pick up the latest config`,
        }
      : {
          title: `${tag} re-deploy to Demo failed`,
          status: "failure",
          message: `Re-deploy failed for ${tag} - demo still runs the previous deployment`,
        };
  }

  if (deployResult !== "success") {
    return {
      title: `Release Candidate ${tag} deploy to Demo failed`,
      status: "failure",
      message:
        "Demo deploy failed - nothing promoted; investigate workflow logs",
    };
  }
  if (e2eResult === "success") {
    return {
      title: `Release Candidate ${tag} deployed to Demo`,
      status: "success",
      message:
        "RC deployed and E2E passed on demo.totalfamily.io - ready for QA validation",
    };
  }
  return {
    title: `Release Candidate ${tag} deployed to Demo`,
    status: "failure",
    message:
      "RC deployed but E2E failed on demo - check test results before promoting",
  };
}

function prodPromote(
  deployResult,
  markStableResult,
  tag,
  releaseBody,
  redeploy
) {
  if (deployResult !== "success") {
    return {
      title: redeploy
        ? `${tag} production re-deploy failed`
        : `${tag} production promote incomplete`,
      status: "failure",
      message: redeploy
        ? `Production re-deploy failed for ${tag} - production still runs the previous deployment`
        : `Production deploy failed for ${tag} - release remains pre-release; ` +
          `retry by re-dispatching this workflow`,
    };
  }
  // A redeploy targets an already-stable release, so mark-stable is skipped by
  // design - its non-success result must not be read as a failed promote.
  if (redeploy) {
    return {
      title: `${tag} re-deployed to production`,
      status: "success",
      message: `Re-deployed the existing stable release ${tag} to production - release state unchanged`,
    };
  }
  if (markStableResult !== "success") {
    return {
      title: `${tag} production promote incomplete`,
      status: "failure",
      message:
        `Production deploy for ${tag} succeeded but mark-stable failed - ` +
        `release still flagged prerelease on GitHub; flip manually`,
    };
  }
  return {
    title: `${tag} released to production`,
    status: "success",
    message:
      releaseBody ||
      `Released ${tag} to production. See GitHub Release for changes.`,
  };
}

function hotfixDeploy(deployResult, e2eResult, tag) {
  if (deployResult !== "success") {
    return {
      title: `Hotfix ${tag} deploy to Demo failed`,
      status: "failure",
      message: `Hotfix ${tag} failed to deploy to demo - investigate workflow logs`,
    };
  }
  if (e2eResult === "success") {
    return {
      title: `Hotfix ${tag} deployed to Demo`,
      status: "success",
      message:
        `Hotfix ${tag} on demo.totalfamily.io - E2E passed, cherry-pick PR open. ` +
        `Promote with Release: Promote to Production dispatch.`,
    };
  }
  return {
    title: `Hotfix ${tag} deployed to Demo`,
    status: "failure",
    message: `Hotfix ${tag} deployed to demo but E2E failed - investigate before promoting`,
  };
}

module.exports = { compose, demoDeploy, prodPromote, hotfixDeploy };

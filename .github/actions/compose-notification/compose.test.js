const { compose, demoDeploy, prodPromote, hotfixDeploy } = require("./compose");

describe("compose-notification: demo-deploy", () => {
  it("reports deploy failure with no E2E claim when deploy fails", () => {
    expect(demoDeploy("failure", "skipped", "v1.8.0")).toEqual({
      title: "Release Candidate v1.8.0 deploy to Demo failed",
      status: "failure",
      message: expect.stringContaining("Demo deploy failed"),
    });
  });

  it("reports success when deploy and E2E both succeed", () => {
    expect(demoDeploy("success", "success", "v1.8.0")).toEqual({
      title: "Release Candidate v1.8.0 deployed to Demo",
      status: "success",
      message: expect.stringContaining("E2E passed"),
    });
  });

  it("reports failure (not success) when deploy succeeds but E2E fails", () => {
    const result = demoDeploy("success", "failure", "v1.8.0");
    expect(result.status).toBe("failure");
    expect(result.message).toContain("E2E failed");
  });

  it("treats cancelled E2E as failure", () => {
    expect(demoDeploy("success", "cancelled", "v1.8.0").status).toBe("failure");
  });

  it("reports redeploy success without reading the absent E2E result as a failure", () => {
    const out = demoDeploy("success", "", "v1.20.0", true);
    expect(out.status).toBe("success");
    expect(out.title).toBe("v1.20.0 re-deployed to Demo");
    expect(out.message).toContain("latest config");
  });

  it("reports redeploy deploy failure distinctly from a fresh-RC failure", () => {
    const out = demoDeploy("failure", "", "v1.20.0", true);
    expect(out.status).toBe("failure");
    expect(out.title).toContain("re-deploy to Demo failed");
    expect(out.message).not.toContain("nothing promoted");
  });
});

describe("compose-notification: prod-promote", () => {
  it("reports deploy failure with retry guidance", () => {
    const result = prodPromote("failure", "skipped", "v1.8.0", "");
    expect(result.status).toBe("failure");
    expect(result.title).toContain("promote incomplete");
    expect(result.message).toContain("retry by re-dispatching");
  });

  it("reports mark-stable failure distinct from deploy failure", () => {
    const result = prodPromote("success", "failure", "v1.8.0", "");
    expect(result.status).toBe("failure");
    expect(result.message).toContain("mark-stable failed");
    expect(result.message).toContain("flip manually");
  });

  it("reports success with release body when both steps succeed", () => {
    expect(
      prodPromote("success", "success", "v1.8.0", "Release notes")
    ).toEqual({
      title: "v1.8.0 released to production",
      status: "success",
      message: "Release notes",
    });
  });

  it("reports redeploy success even though mark-stable was skipped", () => {
    const out = prodPromote("success", "skipped", "v1.16.0", "", true);
    expect(out.status).toBe("success");
    expect(out.title).toBe("v1.16.0 re-deployed to production");
    expect(out.message).toContain("release state unchanged");
  });

  it("reports redeploy deploy failure without pre-release wording", () => {
    const out = prodPromote("failure", "skipped", "v1.16.0", "", true);
    expect(out.status).toBe("failure");
    expect(out.title).toContain("re-deploy failed");
    expect(out.message).not.toContain("pre-release");
  });

  it("falls back to a descriptive message when release body is empty", () => {
    const out = prodPromote("success", "success", "v1.8.0", "");
    expect(out.message).toContain("v1.8.0");
    expect(out.message).toContain("GitHub Release");
  });

  it("falls back when release body is undefined", () => {
    const out = prodPromote("success", "success", "v1.8.0", undefined);
    expect(out.message).toContain("v1.8.0");
  });
});

describe("compose-notification: hotfix-deploy", () => {
  it("reports deploy failure", () => {
    const result = hotfixDeploy("failure", "skipped", "v1.7.4");
    expect(result.status).toBe("failure");
    expect(result.title).toContain("deploy to Demo failed");
  });

  it("reports success with promote guidance when deploy and E2E succeed", () => {
    const result = hotfixDeploy("success", "success", "v1.7.4");
    expect(result.status).toBe("success");
    expect(result.message).toContain(
      "Promote with Release: Promote to Production"
    );
  });

  it("reports E2E failure distinct from deploy failure", () => {
    const result = hotfixDeploy("success", "failure", "v1.7.4");
    expect(result.status).toBe("failure");
    expect(result.title).toContain("deployed to Demo");
    expect(result.message).toContain("E2E failed");
  });
});

describe("compose-notification: dispatcher", () => {
  it("routes demo-deploy to demoDeploy logic", () => {
    const out = compose({
      template: "demo-deploy",
      deployResult: "success",
      secondaryResult: "success",
      tag: "v1.8.0",
    });
    expect(out.status).toBe("success");
  });

  it("treats the redeploy flag as truthy for demo-deploy when passed as an env string", () => {
    const out = compose({
      template: "demo-deploy",
      deployResult: "success",
      secondaryResult: "",
      tag: "v1.20.0",
      redeploy: "true",
    });
    expect(out.title).toBe("v1.20.0 re-deployed to Demo");
  });

  it("routes prod-promote to prodPromote logic", () => {
    const out = compose({
      template: "prod-promote",
      deployResult: "success",
      secondaryResult: "success",
      tag: "v1.8.0",
      releaseBody: "body",
    });
    expect(out.message).toBe("body");
  });

  it("treats the redeploy flag as truthy when passed as an env string", () => {
    const out = compose({
      template: "prod-promote",
      deployResult: "success",
      secondaryResult: "skipped",
      tag: "v1.16.0",
      releaseBody: "body",
      redeploy: "true",
    });
    expect(out.status).toBe("success");
    expect(out.title).toContain("re-deployed");
  });

  it("ignores a false redeploy env string", () => {
    const out = compose({
      template: "prod-promote",
      deployResult: "success",
      secondaryResult: "success",
      tag: "v1.8.0",
      releaseBody: "body",
      redeploy: "false",
    });
    expect(out.title).toBe("v1.8.0 released to production");
  });

  it("routes hotfix-deploy to hotfixDeploy logic", () => {
    const out = compose({
      template: "hotfix-deploy",
      deployResult: "success",
      secondaryResult: "success",
      tag: "v1.7.4",
    });
    expect(out.status).toBe("success");
  });

  it("throws a descriptive error on unknown template", () => {
    expect(() => compose({ template: "unknown-thing" })).toThrow(/Unknown/);
  });
});

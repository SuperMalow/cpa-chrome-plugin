import test from "node:test";
import assert from "node:assert/strict";
import { createCpaManagementAuthFileDownloadRequestConfig } from "./cpaManagement.js";

test("createCpaManagementAuthFileDownloadRequestConfig builds auth file download request", () => {
  const request = createCpaManagementAuthFileDownloadRequestConfig(
    {
      apiKey: "shengwen",
      authType: "bearer",
      baseUrl: "http://localhost:8317/management.html",
      timeoutSeconds: 15,
    },
    "codex-shengwen9690@gmail.com-go.json",
  );

  assert.equal(
    request.url,
    "http://localhost:8317/v0/management/auth-files/download?name=codex-shengwen9690%40gmail.com-go.json",
  );
  assert.equal(request.method, "GET");
  assert.equal(request.headers.Authorization, "Bearer shengwen");
  assert.equal(request.withCredentials, false);
});

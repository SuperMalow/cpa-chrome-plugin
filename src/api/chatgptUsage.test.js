import test from "node:test";
import assert from "node:assert/strict";
import {
  CHATGPT_USAGE_URL,
  DEFAULT_CHATGPT_ACCOUNT_ID,
  fetchLocalChatGptUsage,
  resolveLocalUsageCredentials,
} from "./chatgptUsage.js";

test("fetchLocalChatGptUsage sends the local browser usage request", async () => {
  const originalFetch = globalThis.fetch;
  let request;

  globalThis.fetch = async (url, options) => {
    request = { options, url };
    return new Response(JSON.stringify({ plan_type: "plus" }), {
      status: 200,
      statusText: "OK",
    });
  };

  try {
    const response = await fetchLocalChatGptUsage({
      accessToken: "access-token-1",
    });

    assert.equal(request.url, CHATGPT_USAGE_URL);
    assert.equal(request.options.method, "GET");
    assert.equal(request.options.headers.Authorization, "Bearer access-token-1");
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.equal(request.options.headers["Chatgpt-Account-Id"], DEFAULT_CHATGPT_ACCOUNT_ID);
    assert.equal(request.options.mode, "cors");
    assert.equal(request.options.credentials, "include");
    assert.equal(response.data.status_code, 200);
    assert.deepEqual(response.data.body, { plan_type: "plus" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchLocalChatGptUsage keeps non-json response text", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => new Response("usage limit reached", {
    status: 429,
    statusText: "Too Many Requests",
  });

  try {
    const response = await fetchLocalChatGptUsage({
      accessToken: "access-token-1",
      accountId: "account-id-2",
    });

    assert.equal(response.data.status_code, 429);
    assert.equal(response.data.status_text, "Too Many Requests");
    assert.equal(response.data.body, "usage limit reached");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("resolveLocalUsageCredentials prefers account credentials before fallback token", () => {
  assert.deepEqual(
    resolveLocalUsageCredentials(
      {
        accessToken: "item-token",
        chatgptAccountId: "item-account",
      },
    ),
    {
      accessToken: "item-token",
      accountId: "item-account",
    },
  );
});

test("resolveLocalUsageCredentials reads token from downloaded auth file payload", () => {
  assert.deepEqual(
    resolveLocalUsageCredentials(
      {},
      {
        access_token: "download-token",
        account_id: "download-account",
      },
    ),
    {
      accessToken: "download-token",
      accountId: "download-account",
    },
  );
});

test("resolveLocalUsageCredentials parses serialized auth file content", () => {
  assert.deepEqual(
    resolveLocalUsageCredentials(
      {},
      {
        content: JSON.stringify({
          access_token: "content-token",
        }),
      },
    ),
    {
      accessToken: "content-token",
      accountId: DEFAULT_CHATGPT_ACCOUNT_ID,
    },
  );
});

test("resolveLocalUsageCredentials uses default account id without a token fallback", () => {
  assert.deepEqual(resolveLocalUsageCredentials({}, {}), {
    accessToken: "",
    accountId: DEFAULT_CHATGPT_ACCOUNT_ID,
  });
});

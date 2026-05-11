const CHATGPT_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const DEFAULT_CHATGPT_ACCOUNT_ID = "051331e8-f122-4afc-ab7e-52f61b91b6d7";

const parseResponseText = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const firstPresentString = (...values) => {
  const value = values.find((item) => {
    if (typeof item !== "string" && typeof item !== "number") {
      return false;
    }

    return String(item).trim();
  });

  return value === undefined ? "" : String(value).trim();
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const collectCredentialCandidates = (payload, candidates = [], depth = 0) => {
  const value = parseMaybeJson(payload);

  if (!value || typeof value !== "object" || depth > 4) {
    return candidates;
  }

  candidates.push(value);

  [
    value.auth,
    value.body,
    value.content,
    value.credentials,
    value.data,
    value.file,
    value.tokens,
  ].forEach((child) => {
    collectCredentialCandidates(child, candidates, depth + 1);
  });

  return candidates;
};

const resolveLocalUsageCredentials = (item = {}, authFilePayload = {}) => {
  const candidates = [
    item,
    ...collectCredentialCandidates(authFilePayload),
  ];

  return {
    accessToken: firstPresentString(
      ...candidates.flatMap((candidate) => [
        candidate.accessToken,
        candidate.access_token,
        candidate.access,
        candidate.token,
      ]),
    ),
    accountId: firstPresentString(
      ...candidates.flatMap((candidate) => [
        candidate.chatgptAccountId,
        candidate.chatgpt_account_id,
        candidate.accountId,
        candidate.account_id,
        candidate.organizationId,
        candidate.organization_id,
      ]),
      DEFAULT_CHATGPT_ACCOUNT_ID,
    ),
  };
};

const fetchLocalChatGptUsage = async ({
  accessToken,
  accountId = DEFAULT_CHATGPT_ACCOUNT_ID,
} = {}) => {
  const token = String(accessToken || "").trim();
  const chatgptAccountId = String(accountId || DEFAULT_CHATGPT_ACCOUNT_ID).trim();

  if (!token) {
    throw new Error("账号缺少 access token，无法本地刷新额度");
  }

  const response = await fetch(CHATGPT_USAGE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Chatgpt-Account-Id": chatgptAccountId || DEFAULT_CHATGPT_ACCOUNT_ID,
    },
    mode: "cors",
    credentials: "include",
  });
  const text = await response.text();

  return {
    data: {
      status_code: response.status,
      status_text: response.statusText,
      body: parseResponseText(text),
    },
  };
};

export {
  CHATGPT_USAGE_URL,
  DEFAULT_CHATGPT_ACCOUNT_ID,
  fetchLocalChatGptUsage,
  resolveLocalUsageCredentials,
};

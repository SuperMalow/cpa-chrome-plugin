import axios from "axios";

const MANAGEMENT_CONFIG_PATH = "/v0/management/config";
const MANAGEMENT_AUTH_FILES_PATH = "/v0/management/auth-files";
const MANAGEMENT_AUTH_FILES_STATUS_PATH = "/v0/management/auth-files/status";
const MANAGEMENT_USAGE_PATH = "/v0/management/usage";

const resolveManagementUrl = (baseUrl, path = MANAGEMENT_CONFIG_PATH) => {
  const normalizedBaseUrl = baseUrl?.trim();

  if (!normalizedBaseUrl) {
    throw new Error("请先填写 CPA 接口地址");
  }

  try {
    return new URL(path, normalizedBaseUrl).toString();
  } catch {
    throw new Error("CPA 接口地址格式不正确，请填写完整的 http:// 或 https:// 地址");
  }
};

const resolveManagementConfigUrl = (baseUrl) =>
  resolveManagementUrl(baseUrl, MANAGEMENT_CONFIG_PATH);

const buildAuthHeaders = ({ authType, apiKey }) => {
  const token = apiKey?.trim();
  const headers = {
    Accept: "*/*",
  };

  if (!token) {
    return headers;
  }

  switch (authType) {
    case "apiKey":
      headers["X-API-Key"] = token;
      break;
    case "basic":
      headers.Authorization = `Basic ${token}`;
      break;
    case "custom":
      headers.Authorization = token;
      break;
    case "bearer":
    default:
      headers.Authorization = `Bearer ${token}`;
      break;
  }

  return headers;
};

const createCpaManagementRequestConfig = (
  config,
  path = MANAGEMENT_CONFIG_PATH,
  options = {},
) => {
  const headers = {
    ...buildAuthHeaders(config),
    ...(options.headers || {}),
  };

  return {
    url: resolveManagementUrl(config.baseUrl, path),
    method: options.method || "GET",
    headers,
    timeout: Math.max(Number(config.timeoutSeconds) || 30, 1) * 1000,
    withCredentials: false,
    ...(Object.prototype.hasOwnProperty.call(options, "data")
      ? { data: options.data }
      : {}),
  };
};

const testCpaManagementConfig = (config) =>
  axios(createCpaManagementRequestConfig(config));

const fetchCpaManagementAuthFiles = (config) =>
  axios(createCpaManagementRequestConfig(config, MANAGEMENT_AUTH_FILES_PATH));

const fetchCpaManagementUsage = (config) =>
  axios(createCpaManagementRequestConfig(config, MANAGEMENT_USAGE_PATH));

const patchCpaManagementAuthFileStatus = (config, payload) =>
  axios(
    createCpaManagementRequestConfig(
      config,
      MANAGEMENT_AUTH_FILES_STATUS_PATH,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      },
    ),
  );

export {
  buildAuthHeaders,
  createCpaManagementRequestConfig,
  fetchCpaManagementAuthFiles,
  fetchCpaManagementUsage,
  patchCpaManagementAuthFileStatus,
  resolveManagementConfigUrl,
  resolveManagementUrl,
  testCpaManagementConfig,
};

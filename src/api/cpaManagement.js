import axios from "axios";

const MANAGEMENT_CONFIG_PATH = "/v0/management/config";

const resolveManagementConfigUrl = (baseUrl) => {
  const normalizedBaseUrl = baseUrl?.trim();

  if (!normalizedBaseUrl) {
    throw new Error("请先填写 CPA 接口地址");
  }

  try {
    return new URL(MANAGEMENT_CONFIG_PATH, normalizedBaseUrl).toString();
  } catch {
    throw new Error("CPA 接口地址格式不正确，请填写完整的 http:// 或 https:// 地址");
  }
};

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

const createCpaManagementRequestConfig = (config) => ({
  url: resolveManagementConfigUrl(config.baseUrl),
  method: "GET",
  headers: buildAuthHeaders(config),
  timeout: Math.max(Number(config.timeoutSeconds) || 30, 1) * 1000,
  withCredentials: false,
});

const testCpaManagementConfig = (config) =>
  axios(createCpaManagementRequestConfig(config));

export {
  buildAuthHeaders,
  createCpaManagementRequestConfig,
  resolveManagementConfigUrl,
  testCpaManagementConfig,
};

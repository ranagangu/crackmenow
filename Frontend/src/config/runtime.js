const normalize = (value) => (value || "").replace(/\/+$/, "");

export const API_BASE_URL = normalize(process.env.REACT_APP_API_URL);
export const SOCKET_URL = normalize(process.env.REACT_APP_SOCKET_URL) || API_BASE_URL;

const apiOrigin =
  API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

export const toApiAssetUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
};

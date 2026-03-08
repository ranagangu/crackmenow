import axios from "axios";
import { API_BASE_URL } from "./runtime";

const LEGACY_LOCAL_API = "http://localhost:5000";

const rewriteUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  if (API_BASE_URL) {
    if (url.startsWith(LEGACY_LOCAL_API)) {
      return `${API_BASE_URL}${url.slice(LEGACY_LOCAL_API.length)}`;
    }
    if (url.startsWith("/api") || url.startsWith("/uploads")) {
      return `${API_BASE_URL}${url}`;
    }
  }

  return url;
};

export const setupNetwork = () => {
  if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
  }

  axios.interceptors.request.use((config) => ({
    ...config,
    url: rewriteUrl(config.url),
  }));

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteUrl(input), init);
    }

    if (input instanceof Request) {
      return originalFetch(new Request(rewriteUrl(input.url), input), init);
    }

    return originalFetch(input, init);
  };
};

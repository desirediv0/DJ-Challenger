const configuredApiUrl = import.meta.env.VITE_API_URL;
const isLocalApiUrl =
  configuredApiUrl?.includes("localhost") ||
  configuredApiUrl?.includes("127.0.0.1");
const isLiveBrowser =
  typeof window !== "undefined" &&
  !["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  isLiveBrowser && (!configuredApiUrl || isLocalApiUrl)
    ? "https://djchallenger.in"
    : configuredApiUrl ||
      (import.meta.env.MODE === "development"
        ? "http://localhost:4000"
        : "https://djchallenger.in");

export const API_URL = `${API_BASE_URL}/api`;

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envoie/reçoit le cookie httpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isExpectedAuthCheck =
      error.response?.status === 401 && error.config?.url?.includes("/auth/me");

    if (!isExpectedAuthCheck) {
      if (error.response) {
        console.error(
          `[API ERROR] ${error.response.status} — ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          error.response.data
        );
      } else if (error.request) {
        console.error("[API ERROR] Pas de réponse du serveur", error.request);
      } else {
        console.error("[API ERROR]", error.message);
      }
    }

    return Promise.reject(error);
  }
);
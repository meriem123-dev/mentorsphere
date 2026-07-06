import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envoie/reçoit le cookie httpOnly
  headers: {
    "Content-Type": "application/json",
  },
});
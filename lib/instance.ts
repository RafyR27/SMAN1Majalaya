import environment from "@/config/environment";
import axios from "axios";

const headers = {
  "Content-Type": "application/json",
};

const instance = axios.create({
  baseURL: environment.BASE_URL,
  headers,
  timeout: 60 * 1000,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || "Terjadi kesalahan";

    error.message = message;

    return Promise.reject(error);
  },
);

export default instance;

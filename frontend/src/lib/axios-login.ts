import axios from "axios";
import instance from "./interceptor";
import useUserState from "./login-state";
const apiClient = axios.create();

const LoginApi = {
  loadUser: async (token: string) => {
    try {
      console.log("token", token);
      const response = await apiClient.get("/api/user/load", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  logoutUser: async () => {
    try {
      const response = await apiClient.get("/api/token/logout", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("refreshToken"),
        },
      });
      console.log("logout OK", response);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  verifyToken: async () => {
    try {
      const response = await instance.get("/api/user/verify");
      return response.data;
    } catch (error) {
      return Promise.reject("expired");
    }
  },
  addInfo: async (value: JoinUser) => {
    try {
      const response = await instance.put("/api/user/join", value);
      return response.data;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },
};

export { LoginApi };

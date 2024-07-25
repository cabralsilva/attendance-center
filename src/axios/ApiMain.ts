import axios, { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import LogoutFlow from "../flow/login/LogoutFlow";
import { LS_USER_DATA, URL_LOGIN } from "../const";

export const LOGIN_URL = "/auth";
export const CHECK_TOKEN_URL = "/auth/valid";
export const SEARCH_SIGNATURES_URL = "/signature";
export const SEARCH_COMPANY_URL = "/company";

const apiMain: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

const prepareRequestParams = (options: any) => {
  const params = {
    params: options,
    paramsSerializer: (params: any) => {
      return qs.stringify(params);
    },
  };

  return params;
};

apiMain.interceptors.request.use(
  async (config: any) => {
    config.headers = {
      Accept: "application/json",
    };

    if (config.url === URL_LOGIN) {
      return config
    }

    const userDataStr = localStorage.getItem(LS_USER_DATA);
    if (userDataStr === undefined || userDataStr === null) {
      throw Error("Invalid session")
    }
    const userData = JSON.parse(userDataStr);
    if (userData && userData.access_token) {
      config.headers = {
        Authorization: `Bearer ${userData.access_token}`,
        Accept: "application/json",
      };
      return config;
    }
    
    return config;
  },
  (error: AxiosError) => {
    errorHandler(error);
  }
);

apiMain.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      LogoutFlow.exec()
      // router.push({ name: 'login' })
      return
    }
    return errorHandler(error);
  }
);

const errorHandler = (error: AxiosError) => {
  if (error.response) {
    if (error.response.status >= 400 && error.response.status < 500) {
      return Promise.reject(error.response.data);
    }
  }
  return Promise.reject(error);
};

export { apiMain, prepareRequestParams };

import { OK } from "http-status";
import { apiMain } from "../../axios/ApiChat";
import { LS_USER_DATA, URL_LOGIN } from "../../const";
import { ICredentials } from "../../models/ICredentials";
import LogoutFlow from "./LogoutFlow";

class LoginFlow {
  async exec(credentials: ICredentials) {
    const response = await apiMain.post(
      URL_LOGIN,
      {},
      {
        auth: credentials,
      }
    );

    if (response.status === OK) {
      localStorage.setItem(LS_USER_DATA, JSON.stringify(response.data));
      return
    }

    LogoutFlow.exec();
    throw new Error(response.data.message)
  }
}

export default new LoginFlow
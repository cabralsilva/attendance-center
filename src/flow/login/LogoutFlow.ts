import { OK } from "http-status";
import { apiMain } from "../../axios/ApiMain";


class LogoutFlow {
  async exec() {
    const response = await apiMain.get(
      "/logout"
    );

    if (response.status === OK) {
      localStorage.clear();
      return
    }
  }
}

export default new LogoutFlow
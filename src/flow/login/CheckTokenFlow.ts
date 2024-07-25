import { jwtDecode } from "jwt-decode";
import { LS_USER_DATA } from "../../const";

class CheckTokenFlow {
  isValid() {
    const userDataStr = localStorage.getItem(LS_USER_DATA);

    if (userDataStr === undefined || userDataStr === null) {
      return false
    }

    const userData = JSON.parse(userDataStr);
    if (userData && userData.access_token) {
      const decoded = jwtDecode(userData.access_token)
      const currentTime = Date.now() / 1000;

      if (decoded.exp && (decoded.exp > currentTime)) {
        return true;
      }
    }
    return false
  }
}

export default new CheckTokenFlow
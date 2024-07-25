import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiMain";

class DestroyQueueFlow {
  async exec(userId: string, accessID: string): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.patch(
      `/chat-message/destroy-queue/${userId}/${accessID}`
    );
    return response
  }
}

export default new DestroyQueueFlow
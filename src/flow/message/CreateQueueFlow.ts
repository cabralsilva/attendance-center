import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiMain";

class CreateQueueFlow {
  async exec(userId: string, accessID: string): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.patch(
      `/chat-message/create-queue/${userId}/${accessID}`
    );
    return response
  }
}

export default new CreateQueueFlow
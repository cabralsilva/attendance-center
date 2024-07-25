import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiMain";
import { IChatMessage } from "../../models/IChatMessage";

class PublishMessageFlow {
  async exec(payload: IChatMessage): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.post(
      "/chat-message/publish", payload
    );
    return response
  }
}

export default new PublishMessageFlow
import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiMain";
import { IChatMessage } from "../../models/IChatMessage";

class CreateMessageFlow {
  async exec(payload: IChatMessage): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.post(
      "/chat-message", payload
    );
    return response
  }
}

export default new CreateMessageFlow
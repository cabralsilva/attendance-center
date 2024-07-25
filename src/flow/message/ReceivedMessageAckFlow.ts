import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiMain";
import { StatusChatMessage } from "../../models/IChatMessage";

class ReceivedMessageAckFlow {
  async exec(messageId: string): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.patch(
      `/chat-message/${messageId}`, { status: StatusChatMessage.RECEIVED }
    );
    return response
  }
}

export default new ReceivedMessageAckFlow
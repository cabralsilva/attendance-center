import { AxiosResponse } from "axios";
import { apiChat, prepareRequestParams } from "../../axios/ApiMain";

class SearchMessageFlow {
  async exec(filters: any): Promise<AxiosResponse<any, any>> {
    const response = await apiChat.get(
      "/chat-message",
      prepareRequestParams(filters)
    );
    return response
  }
}

export default new SearchMessageFlow
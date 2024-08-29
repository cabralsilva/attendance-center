import { AxiosResponse } from "axios";
import { apiMain } from "../../axios/ApiChat";
import { prepareRequestParams } from "../../axios/ApiMain";

class SearchPlanFlow {
  async exec(filters: any): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.get(
      "/plan",
      prepareRequestParams(filters)
    );
    return response
  }
}

export default new SearchPlanFlow
import { AxiosResponse } from "axios";
import { apiMain, prepareRequestParams } from "../../axios/ApiMain";

class SearchPatientFlow {
  async exec(filters: any): Promise<AxiosResponse<any, any>> {
    const response = await apiMain.get(
      "/patient",
      prepareRequestParams(filters)
    );
    return response
  }
}

export default new SearchPatientFlow
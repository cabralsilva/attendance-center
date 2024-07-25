import { IDefaultAdmin } from "./IDefault";


export interface IFacebookData {
  userId: string
  email: string
  name: string
  shortName: string
}

export interface IGoogleData {
  accountId: string;
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  familyName: string;
  givenName: string;
  picture: string;
}
export interface IAccount extends IDefaultAdmin {
  nameResponsible: string;
  socialIdResponsible: string;
  phones: string[];
  email: string;
  origin: string;
  checked: boolean;
  googleData: IGoogleData;
  facebookData: IFacebookData
}
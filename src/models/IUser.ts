import { IGoogleData, IFacebookData } from "./IAccount";
import { IAdminUserProfile } from "./IAdminUserProfile";
import { IDefault } from "./IDefault";


export interface IUser extends IDefault {
  fullName: string;
  nickName: string;
  socialId: string;
  emailAccess: string;
  passwordAccess: string | undefined;
  salt: string | undefined;
  codeRecoveryPassword: string | undefined;
  tokenRecoveryPassword: string | undefined;
  phones: string[];
  profile: string | IAdminUserProfile
  googleData: IGoogleData;
  facebookData: IFacebookData;
  active: boolean
}
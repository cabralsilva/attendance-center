import { IAccount } from "./IAccount";

export interface IDefault extends IDefaultAdmin {
  account: string | IAccount;
}

export interface IDefaultAdmin {
  _id: string;
  createdAtDateTime: Date;
  updatedAtDateTime: Date;
}

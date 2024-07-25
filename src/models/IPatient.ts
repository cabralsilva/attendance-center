import { IDefault } from "./IDefault";

export enum PatientGenre {
  "MALE" = "MALE",
  "FEMALE" = "FEMALE"
}
export interface IPatient extends IDefault {
  fullName: string;
  genre: PatientGenre;
  bornDate: Date;
  phones: string[];
  email: string;
  socialId: string;
  sendEmailAsWelcome: boolean;
  user: any
}
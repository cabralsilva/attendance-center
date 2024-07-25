import { IDefaultAdmin } from "./IDefault"

export interface IAdminUserProfile extends IDefaultAdmin {
  name: string
  roles: string[]
  category: CategoryOfAdminUserProfile
  active: boolean
}

export enum CategoryOfAdminUserProfile {
  "ADMIN" = "ADMIN", //usuario principal da account
  "MASTER" = "MASTER", //usuario coringa do sistema
  "PATIENT" = "PATIENT",
  "OTHER" = "OTHER",
}

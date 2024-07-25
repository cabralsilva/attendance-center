import { IChatMessage } from "./IChatMessage";
import { IPatient } from "./IPatient";


export interface IMessageControl {
  patient: IPatient
  topic: string
  queue: string
  subscribed: boolean
  messages: IChatMessage[]
  amountNewMessages: number
}
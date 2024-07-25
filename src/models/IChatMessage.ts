import { IDefault } from "./IDefault";
import { IUser } from "./IUser";

export enum StatusChatMessageTranslate {
  NOT_SENT = "Enviando...",
  SENT = "Enviado",
  RECEIVED = "Entregue",
  SEEN = "Visto",
}

export enum StatusChatMessage {
  NOT_SENT = "NOT_SENT",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  SEEN = "SEEN",
}

export enum TypeOfMessage {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  RECEIVED = "RECEIVED",
  SEEN = "SEEN",
}

export interface IChatMessage extends IDefault {
  authorName: string
  author: string | IUser
  content: string
  status: StatusChatMessage
  sendDateTime: Date
  queue: string
  routerKey: string

  type: TypeOfMessage
  receivedBy: string
  receivedDateTime: Date
  receivements: {
    receivedBy: string
    receivedDateTime: Date
  }[]

  seenBy: string
  seenDateTime: Date
  seens: {
    seenBy: string
    seenDateTime: Date
  }[]
}
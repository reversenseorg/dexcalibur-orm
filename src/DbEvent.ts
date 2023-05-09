import { INode } from "../orm/INode";

export enum OpCode {
  NONE,
  CREATE,
  READ,
  UPDATE,
  DELETE,
  EXISTS
}

export enum ObjType {
  DOCUMENT,
  INDEX
}

export interface DbEvent {
  uid:string, // must include user session / be secure
  db?: string;
  operation: OpCode,
  objtype: ObjType,
  name?:string,
  obj?: INode,
  result: any
}

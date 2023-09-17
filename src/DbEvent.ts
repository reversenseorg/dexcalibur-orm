import { INode } from "./INode.js";

/**
 * To represent a DB operation iin event
 *
 * @enum
 */
export enum OpCode {
  NONE,
  CREATE,
  READ,
  UPDATE,
  DELETE,
  EXISTS
}

/**
 * To differentiate event related to docs/entries from event related to collection/index/schema
 *
 * @enum
 */
export enum ObjType {
  DOCUMENT,
  INDEX
}

/**
 * Interface to help to design observer/listener pattern in ORM connectors
 *
 * @interface
 */
export interface DbEvent {
  uid:string, // must include user session / be secure
  db?: string;
  operation: OpCode,
  objtype: ObjType,
  name?:string,
  obj?: INode,
  result: any
}

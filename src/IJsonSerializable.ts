import {IStringIndex} from "./core/IStringIndex.js";

export interface SerializeOptions {
  override?: IStringIndex<any>,
  exclude?: IStringIndex<any>,
  /**
   * A list of name of fiel to include into the value returned.
   * Others fields are ignored.
   * @type {string[]}
   */
  include?: string[],
  offset?:number,
  size?:number,
  /**
   * Extra optional field to support extra features
   * @type {any}
   */
  extra?:any
}

export interface IJsonSerializable extends IStringIndex<any>{
  toJsonObject( pOption?:SerializeOptions):any;
}
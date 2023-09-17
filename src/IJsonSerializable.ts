import {IStringIndex} from "./core/IStringIndex.js";

export interface SerializeOptions {
  override?: IStringIndex<any>,
  exclude?: IStringIndex<any>,
}

export interface IJsonSerializable extends IStringIndex<any>{
  toJsonObject( pOption?:SerializeOptions):any;
}
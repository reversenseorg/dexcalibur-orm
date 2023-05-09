import {IStringIndex} from "./IStringIndex";

export interface SerializeOptions {
  override?: IStringIndex,
  exclude?: IStringIndex,
}

export interface IJsonSerializable extends IStringIndex{
  toJsonObject( pOption?:SerializeOptions):any;
}

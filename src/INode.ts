import {NodeInternalType} from "./NodeInternalType";
import {IJsonSerializable, SerializeOptions} from "./IJsonSerializable";
import {IStringIndex} from "../../IStringIndex";

export interface INode extends IJsonSerializable{

  __:NodeInternalType;
  getUID():string|null;
  tags:number[];
}

export class Node implements INode{
  __:NodeInternalType = NodeInternalType.NONE;
  uid:string|null = null;
  tags:number[] = [];

  constructor(pConfig:any = null) {
    if(pConfig != null){
      for(const  i in pConfig){
        (this as IStringIndex)[i]=pConfig[i];
      }
    }
  }

  protected _init(pConfig:any):void {
    if(pConfig != null){
      for(const  i in pConfig){
        (this as IStringIndex)[i]=pConfig[i];
      }
    }
  }

  getUID():string|null  {
    return this.uid;
  }

  toJsonObject(pOption?: SerializeOptions): any {
    const o = {};

    // browse ppts
    for(const i in this){
      if(pOption!=null){

        // skip property if excluded
        if(pOption.exclude!=null && pOption.exclude.indexOf(i)>-1) continue;

        if(pOption.override!=null && pOption.override.hasOwnProperty(i)){
          // @ts-ignore
          o[i] = pOption.override[i];
        }else{
          switch(i){
            default:
              // @ts-ignore
              o[i] = this[i];
              break;
          }
        }
      }else {
        switch(typeof this[i]){
          case "object":
          default:
            (o as IStringIndex)[i] = this[i];
            break;
        }
      }
    }

    return o;
  }
}

export interface INodeMap {
  [nodeUID:string] :INode
}

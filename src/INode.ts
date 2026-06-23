/*
    Reversense platform / ORM core - Reversense is an automated reverse engineering and analysis platform
    focused on security, privacy, quality, accessibility and safety assessment of softwares,
    including mobile app and firmware.
    Copyright (C) 2026  Reversense SAS

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {ENodeInternalTypes, NodeInternalType} from "./NodeInternalType.js";
import {IJsonSerializable, SerializeOptions} from "./IJsonSerializable.js";
import {IStringIndex} from "./core/IStringIndex.js";


export interface INodeRef {
  __:NodeInternalType;
  _uid?:any;
}

export type TagUUID = number;

export interface INode extends IJsonSerializable{

  __:NodeInternalType;

  getUID():string|null;

  tags:TagUUID[];
}

/**
 * The most basic implementation for a Node
 *
 * @class
 */
export class Node implements INode{

  __:NodeInternalType = ENodeInternalTypes.NONE;

  uid:string|null = null;

  tags:TagUUID[] = [];

  constructor(pConfig:any = null) {
    if(pConfig != null){
      for(const  i in pConfig){
        (this as IStringIndex<any>)[i]=pConfig[i];
      }
    }
  }

  protected _init(pConfig:any):void {
    if(pConfig != null){
      for(const  i in pConfig){
        (this as IStringIndex<any>)[i]=pConfig[i];
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
            (o as IStringIndex<any>)[i] = this[i];
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

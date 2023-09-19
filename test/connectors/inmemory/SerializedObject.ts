import {IStringIndex} from "../../../src/core/IStringIndex.js";


/**
 * to represent a serialized object
 */
export default class SerializedObject implements IStringIndex<any>
{
  static refs:any = {};

  __type:string = "";
  __raw:any = null;

  constructor(pConfig:any=null){
    if(pConfig!==null){
        for(let i in pConfig){
          (this as IStringIndex<any>)[i] = pConfig[i];
        }
    }
  }

  /**
  * To update reference mapping
  *
  * @param {any} pRefs
  * @param {boolean} pAppend Optional. If true update exisiting refs
  */
  static defineReference(pRefs:any, pUpdate = false){
  if(pUpdate){
    Object.keys(pRefs).map( (k:string)=>{ SerializedObject.refs[k]=pRefs[k] });
  }else{
    SerializedObject.refs = pRefs;
  }
  }

  /**
  * To check if a node is serializable
  *
  * @param obj
  */
  static isSerializable(obj:any):boolean{
    return (obj.serialize !=null) && (typeof obj.serialize==='function');
  }

  /**
  * To check if an object can be unserialized by this serializer
  *
  * @param {any} obj Serialized object
  */
  static isUnserializable(obj:any):boolean{
    return (obj.__type!=null)
        && (obj.__raw!=null)
        && (SerializedObject.refs[obj.__type]!==null);
  }

  static from(obj:any,type:string){
    let o = new SerializedObject();

    o.__type = type;
    o.__raw = obj;

    return o;
  }

  unserialize():any{
    return SerializedObject
        .refs[this.__type]
        .unserialize(this.__raw);
  }

}

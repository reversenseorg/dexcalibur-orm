

import {MonitoredError} from "../../../errors/MonitoredError";

export class OrmException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static UNDEFINED_PRIMARY_KEY = (pType:any)=>{ return new OrmException(`The primary key is used but undefined [type=${pType}]`, 1701) };

  //static GRAPH_SVC_NOT_READY = (vName:string)=>{ return new InMemoryException("Graph service is not initialized : "+vName, 1002) };

  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+ORM', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

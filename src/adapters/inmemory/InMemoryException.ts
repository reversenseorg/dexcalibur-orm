

import {MonitoredError} from "../../../../errors/MonitoredError";

export class InMemoryException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static NULL_DB_INSTANCE = ()=>{ return new InMemoryException("DB instance is null", 1001) };
  //static GRAPH_SVC_NOT_READY = (vName:string)=>{ return new InMemoryException("Graph service is not initialized : "+vName, 1002) };

  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+DB', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

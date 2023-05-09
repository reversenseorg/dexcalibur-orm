

import {MonitoredError} from "../../errors/MonitoredError";

export class ConnectorFactoryException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static UNDEFINED_CONNECTOR_OPTS = (pConnType:string)=>{ return new ConnectorFactoryException("Connector options are required for : "+pConnType, 1401) };
  static UNDEFINED_GLOBAL_OPTS = ()=>{ return new ConnectorFactoryException("Connector factory is not configured", 1402) };
  static UNKNOW_CONNECTOR = (pConnType:string)=>{ return new ConnectorFactoryException("Invalid connector : "+pConnType, 1403) };



  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+DB:CONN', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

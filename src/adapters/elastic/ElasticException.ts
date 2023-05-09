

import {MonitoredError} from "../../../../errors/MonitoredError";

export class ElasticException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static NULL_DB_INSTANCE = ()=>{ return new ElasticException("DB instance is null", 1101) };
  static CLUSTER_CLIENT_NOT_CONFIGURED = ()=>{ return new ElasticException("Configuration for cluster client is required", 1102) };
  static BASIC_CLIENT_NOT_CONFIGURED = ()=>{ return new ElasticException("Configuration for basic client is required", 1103) };
  static NODE_TYPE_NOT_MAPPED = (pType:number)=>{  return new ElasticException("This node type is declared as persisted in elasticDB but it is not mapped to an index pattern : "+pType, 1104) }
  static NODE_TYPE_IS_MANDATORY = (pType:string, pName:string)=>{ return new ElasticException("Node type is mandatory to get [type='"+pType+",name='"+pName+"']", 1105) };
  static CANNOT_CRUD_ON_WILDCARD_INDEX = (pName:string,pIdx:string[])=>{ return new ElasticException(`Cannot perform CRUD operation on multiple index [name=${pName},idx=${pIdx.join(',')}]`, 1106) };
  static NOT_SUPPORTED = (pMsg:string)=>{return new ElasticException("Not supported : "+pMsg, 1107) };

  static DELETE_FAILURE_DOCID_NULL = ()=>{return new ElasticException("Documment cannot be deleted : Document ID is null or undefined.", 1108) }

  static CANNOT_INSERT_OBJECT = (pType:any,pKey:any)=>{ return new ElasticException(`Insert failure : object [type=${pType}][key=${pKey}] cannot be created `, 1205) };



  //static GRAPH_SVC_NOT_READY = (vName:string)=>{ return new InMemoryException("Graph service is not initialized : "+vName, 1002) };

  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+DB:ELASTIC', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

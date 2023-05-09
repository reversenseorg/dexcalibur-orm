

import {MonitoredError} from "../../../../errors/MonitoredError";

export class CacheException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static NULL_DB_INSTANCE = ()=>{ return new CacheException("DB instance is null", 1201) };
  static CANNOT_CREATE_INDEX_WITHOUT_TYPE = ()=>{ return new CacheException("A cached index cannot created without specifying a Node type", 1202) };
  static CANNOT_CREATE_COLLECTION_WITHOUT_TYPE = ()=>{ return new CacheException("A cached collection cannot created without specifying a Node type", 1203) };
  static INDEX_CANNOT_BE_PERSISTED = ()=>{ return new CacheException("Try to write into a cached index which cannot be persisted", 1204) };
  static COLL_CANNOT_BE_PERSISTED = ()=>{ return new CacheException("Try to write into a cached collection which cannot be persisted", 1205) };
  static DENY_SEARCH_WITH_AGGREGATE = ()=>{ return new CacheException("Performing search with aggregate operation on cache is denied : cache is a partial view of the DB.", 1206) };
  static DENY_SEARCH_WITH_JOIN = ()=>{ return new CacheException("Performing search with join operation on cache is not supported", 1207) };
  static DENY_SEARCH_WITH_INTERSECT = ()=>{ return new CacheException("Performing search with intersect operation on cache is not supported", 1208) };

  static CANNOT_INSERT_OBJECT = (pType:any,pKey:any)=>{ return new CacheException(`Insert failure : object [type=${pType}][key=${pKey}] cannot be created `, 1209) };



  //static GRAPH_SVC_NOT_READY = (vName:string)=>{ return new InMemoryException("Graph service is not initialized : "+vName, 1002) };

  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+DB:CACHE', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

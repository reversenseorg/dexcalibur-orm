import {DataSource} from "./DataSource.js";
import {NodeType} from "./NodeType.js";
import * as Log from "./utils/Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class DataSourceHelper {

  /*
  static MEM:DataSource = (new DataSource(InMemoryConnector.UUID,{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
      Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
      const o = pContext.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);
      Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
      return o;
    }
  }));

  /*
  static REDIS:DataSource = new DataSource("redis",{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
      Logger.debug("DATA SOURCE [REDIS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
      const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
      Logger.debug("DATA SOURCE [REDIS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
      return o;
    }
  });

  static ELASTIC:DataSource = new DataSource(ElasticConnector.UUID,{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
      Logger.debug("DATA SOURCE [ELASTIC]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
      const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
      Logger.debug("DATA SOURCE [ELASTIC]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
      return o;
    }
  });
  /*
  static FILE:DataSource = new DataSource("fs",{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
      Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
      const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
      Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
      return o;
    }
  });*/

  static addSource( pName:string, pDataSource:DataSource):void {
    DataSourceHelper[pName] = pDataSource;
  }


  static addAsyncSource( pName:string, pDataSource:DataSource):void {
    DataSourceHelper[pName] = pDataSource;
    DataSourceHelper[pName].asyncSrc = true;
  }
}

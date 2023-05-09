/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import ElasticDbCollection from "./ElasticDbCollection";
import ElasticDbIndex from "./ElasticDbIndex";
import {
  DbSetMap,
  DbSizesMap,
  IDatabase, IDbCollection, IDbIndex
} from "../../../orm/DbAbstraction";
import {ElasticAPI} from "./ElasticAPI";
import {NodeType} from "../../../orm/NodeType";
import {NodeProperty} from "../../../orm/NodeProperty";
import * as Log from "../../../utils/Logger";
import ElasticConnector, { IndexMapping } from "./ElasticConnector";
import {IAppContext} from "../../IAppContext";
import {ElasticException} from "./ElasticException";
import { Subject } from "rxjs";
import { DbEvent } from "../../DbEvent";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class ElasticDb implements IDatabase
{

    _s:ElasticAPI;

    _internalIdx:string[] = [];

    conn:ElasticConnector;

    indexes:DbSetMap = {};
    sizes:DbSizesMap = {};


    onEvent$:Subject<DbEvent> = new Subject<DbEvent>();


  /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {ElasticDb}
     * @constructor
     */
    constructor(pConnector:ElasticConnector ){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};

        //let db = new Database(pPath, { verbose:Logger.raw });

        console.log("Test Elastic DB");
        this._s = new ElasticAPI( this, pConnector.getClient() );
        //this._ps = this._s._generatePreparedStmt(METADATA_TABLE, ElasticDb.TYPE);
        this._refresh();
        (async ()=>{ await this.loadIndexes(true); })();
    }

    supportsEvent():boolean {
      return true;
    }

  /**
   * Push a new event in the pipeline
   *
   * @param pEvent
   */
  newEvent(pEvent:DbEvent):void {
    pEvent.db = this.conn.getType();
    this.onEvent$.next(pEvent);
  }

    /**
     * To prepare an new elastic index
     *
     * 1/ Create 'internal table' to hold metadata about collection/index if needed
     */
    install(pElasticIndexName:string){
        return;
    }

    getMapping():IndexMapping {
      return this.conn.getMapping();
    }

    /**
     * To refresh some meta data including :
     *
     * - table name list
     *
     * @private
     */
    private _refresh():any {
      return;
    }




  /**
     * To verify if an elastic exists or not
     *
     * @param pName
     * @private
     */
    exists( pName:string,pForce=false):boolean {
      return true;
      //( async ()=>{ await this.loadIndexes(pForce); })();
      //  return (this._internalIdx.indexOf(pName)>-1);// this.indexes[pName]!=null;
    }

    /**
     * To load the list of existing indexes
     *
     * @method
     */
    async loadIndexes(pForce=false):Promise<void>{
      /*if(this._internalIdx.length ==0 || pForce){
          const data = await this._s._client.indices.get({ index: "*"});
        console.log(await data);
          this._internalIdx = Object.keys(data);
          console.log(this._internalIdx);
      }*/
    }


    getAll():any{
        return this.indexes;
    }


    /**
     * To create a table with property string-based primary key into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(pIndexName:string, pNodeType:NodeType):IDbCollection{

        const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

        if(this.indexes[name]!=null){
            return this.indexes[name] as IDbCollection;
        }


        this.indexes[name] = (new ElasticDbCollection(this._s, this.conn.getMapping()[pNodeType.getType()], pNodeType)).setDB(this);

        // load index where linked node are stored
        if(pNodeType.hasExternalProperties()){
            pNodeType.getExternalProperties().map( (ppt:NodeProperty) => {
                if(!this.exists(ppt.getNodeType().getName())){
                  // @ts-ignore
                    const c:ElasticDbCollection = this.newCollection(ppt.getNodeType().getName(), ppt.getNodeType()) as ElasticDbCollection;
                    (this.indexes[name] as ElasticDbCollection).link(c);
                    Logger.raw("LINKING new extra coll "+c.name+" TO "+(this.indexes[name] as any).name);
                }else{
                  // @ts-ignore
                    const b:ElasticDbCollection = this.getCollection(ppt.getNodeType().getName(), ppt.getNodeType()) as ElasticDbCollection;
                    (this.indexes[name] as ElasticDbCollection).link(b);
                    Logger.raw("LINKING existing extra coll "+b.name+" TO "+(this.indexes[name] as any).name);
                }
            });
        }

        // if there is not index for this collection in the DB, and the name not contains wildcard
        // the index is created
        const idxs = this.conn.getMapping()[pNodeType.getType()];
        if(idxs == null || !Array.isArray(idxs) || idxs[0]==null){
          throw ElasticException.NODE_TYPE_NOT_MAPPED(pNodeType.getType());
        }

        // not resolve wildcard
        /*idxs.map( (vIndexPattern:string)=>{
          if(vIndexPattern.indexOf('*')==-1){
            if(this._internalIdx.indexOf(vIndexPattern)==-1){
              console.log("[*] Creating index '"+vIndexPattern+"'")
              this._s._createIndex(vIndexPattern);
            }
          }
        });*/


        return this.indexes[name] as IDbCollection;
    }


    /**
     * To create a table with  numeric-based primary key (id) into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(pIndexName:string, pNodeType:NodeType):IDbIndex{


      const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

      if(this.indexes[name]!=null){
        return this.indexes[name] as IDbIndex;
      }


      this.indexes[name] = (new ElasticDbIndex(this._s, this.conn.getMapping()[pNodeType.getType()], pNodeType)).setDB(this);

      // load index where linked node are stored
      if(pNodeType.hasExternalProperties()){
        pNodeType.getExternalProperties().map( (ppt:NodeProperty) => {
          if(!this.exists(ppt.getNodeType().getName())){
            const c:ElasticDbIndex = this.newIndex(ppt.getNodeType().getName(), ppt.getNodeType()) as ElasticDbIndex;
            //(this.indexes[name] as ElasticDbIndex).link(c);
            Logger.raw("LINKING new extra idx "+c.name+" TO "+(this.indexes[name] as any).name);
          }else{
            const b:ElasticDbIndex = this.getIndex(ppt.getNodeType().getName(), ppt.getNodeType()) as ElasticDbIndex;
            //(this.indexes[name] as ElasticDbIndex).link(b);
            Logger.raw("LINKING existing extra idx "+b.name+" TO "+(this.indexes[name] as any).name);
          }
        });
      }

      // if there is not index for this collection in the DB, and the name not contains wildcard
      // the index is created
      const idxs = this.conn.getMapping()[pNodeType.getType()];
      if(idxs == null || !Array.isArray(idxs) || idxs[0]==null){
        throw ElasticException.NODE_TYPE_NOT_MAPPED(pNodeType.getType());
      }

      // not resolve wildcard
     /* idxs.map( (vIndexPattern:string)=>{
        if(vIndexPattern.indexOf('*')==-1){
          if(this._internalIdx.indexOf(vIndexPattern)==-1){
            this._s._createIndex(vIndexPattern);
          }
        }
      });*/


      return this.indexes[name] as IDbIndex;
    }

    /**
     * To create the specified index in the DB
     *
     * @param {string} vPattern
     * @method
     * @async
     */
    async createIndex( vPattern:string):Promise<boolean> {
      return await this._s._createIndex(vPattern);
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name:string, pTemplate:NodeType|null = null):IDbIndex{

        if(pTemplate == null){
          throw ElasticException.NODE_TYPE_IS_MANDATORY("index",name);
        }
        if(this.indexes.hasOwnProperty(name)===false){
            this.newIndex(name, pTemplate);
        }

        return this.indexes[name] as IDbIndex;
    }

    /**
     * To get an index by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {ElasticDbIndex} Index with the given name
     * @method
     * @since 1.0.0
     */
    getIndexOf(pTemplate:NodeType):IDbIndex{
        return this.getIndex(pTemplate.getName(), pTemplate);
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @param {NodeType} pTemplate Default is NULL. Node type
     * @returns {ElasticDbCollection} Index with the given name
     * @method
     */
    getCollection(name:string, pTemplate:NodeType|null = null):IDbCollection{

        if(pTemplate == null){
          throw ElasticException.NODE_TYPE_IS_MANDATORY("collection",name);
        }

        if(this.indexes.hasOwnProperty(name)===false){
            this.newCollection(name, pTemplate);
        }
        return this.indexes[name] as IDbCollection;
    }

    /**
     * To get a collection by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {ElasticDbCollection} Index with the given name
     * @method
     * @since 1.0.0
     */
    getCollectionOf(pTemplate:NodeType):IDbCollection{
        return this.getCollection(pTemplate.getName(), pTemplate);
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     */
    toJsonObject():any{
        let o:any= {};

        o.indexes = {};
        for(let i in this.indexes){
            o.indexes[i] = this.indexes[i].toJsonObject();
        }

        return o;
    }

    /**
     * To get the instance of the project for this DB
     */
    getProject():IAppContext {
        return this.conn.ctx;
    }


    //
    async asyncSearch( pQuery:any, pNodeType:NodeType):Promise<any> {
      return this._s._client.search(pQuery)
    }

    // ============ serialize ============

    isSerializable():boolean{
        return false;
        /*let ret:boolean=true;
        for(let i in this.indexes){
            ret = ret && this.indexes[i].isSerializable();
        }
        return ret;*/
    }

    unserialize(obj:any):void{
        /*
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = SqliteDbIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = SqliteDbCollection.unserialize(obj.indexes[i]);
            }
        }*/
    }

    serialize():any{
        return null;
        /*
        let o:any=new Object();

        o.indexes = {};
        for(let i in this.indexes){
            if(typeof this.indexes[i].isSerializable === 'function')
                o.indexes[i] = this.indexes[i].serialize();
            else if(typeof this.indexes[i].toJsonObject === 'function')
                o.indexes[i] = this.indexes[i].toJsonObject();
            else
                o.indexes[i] = this.indexes[i];
        }

        return o;*/
    }
}

export {ElasticDbIndex as Index};
export {ElasticDbCollection as Collection};

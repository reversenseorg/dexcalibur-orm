'use strict';

import {IDatabase, IDatabaseAdapter} from "../../../orm/DbAbstraction";
import {IAppContext} from "../../IAppContext";
import { CacheDb, Collection, Index } from "./CacheDb";
import {ConnectorFactory, ConnectorOptions} from "../../ConnectorFactory";
import {DbEvent} from "../../DbEvent";
import {NodeType} from "../../../orm/NodeType";
import {CacheException} from "./CacheException";

const TYPE  = 'cache';
const NAME = 'Cache';
const DESC = 'Data are stored in memory. Only saved data can be restored (such as intercepted bytecode, DEX file loaded dynamically and more)';

interface DatabaseInstanceList {
    [name :string] :IDatabase|null
}


interface IndexMapping {
  [ormIndex:string] :string[];
}

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class CacheConnector implements IDatabaseAdapter
{
    static UUID = TYPE;

    ctx:any = null;

    options:ConnectorOptions;

    type:string = TYPE;

    db:CacheDb|null = null;

    tmpDbs:DatabaseInstanceList = {};

    mapping: IndexMapping = {};

    cluster:IDatabaseAdapter[];

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pContext:IAppContext, pOptions:ConnectorOptions = {}){
        this.ctx = pContext;
        this.options = pOptions;

        this.cluster = [];
        // Cache connector involves defacto at least 1 other connector : inmemory
        // Most of time it contains 2 : elastic/sqlite & inmemory
        if(pOptions.cluster && this.options.factory!=null && this.options.factory!=null){
          pOptions.cluster.map((vConnectorName:string)=>{

            this.cluster.push((this.options.factory as ConnectorFactory).newConnector(vConnectorName, pContext, {
              ...((this.options.factory as ConnectorFactory).options.connectors as any) [vConnectorName]
              // add additional cluster node config here
            }));
          })
        }
    }

    getSubConnectors():IDatabaseAdapter[] {
      return this.cluster;
    }

    getSubConnector(pName:string):IDatabaseAdapter|null{
      for(let i=0; i<this.cluster.length; i++){
        if(this.cluster[i].getType()===pName){
          return this.cluster[i];
        }
      }
      return null;
    }

    /**
     * An index pattern must hase the  same syntax than an elastic pattern
     *
     * Chainable
     *
     * @param {string} pCollectionName The collection/index name in ORM
     * @param {string} pIndexPattern A pattern matching the elastic indexes
     * @return {ElasticConnector}
     * @method
     */
    addIndicesMapping(pCollectionName: string, pIndexPattern: string) {
      if(this.mapping[pCollectionName]==null){
        this.mapping[pCollectionName] = [];
      }
      this.mapping[pCollectionName].push(pIndexPattern);
      return this;
    }

    /**
     * empty
     * @returns {boolean}
     */
    exists():boolean{
        // nothing to do
        return true;
    }

    /**
     * empty
     * @returns {boolean}
     */
    create():boolean{
        // nothing to do
        return true;
    }

  /**
   *
   * @param pEvent
   */
  clusterEventsListener( pEvent:DbEvent){
      switch (pEvent.db){
        case 'elastic':
          // TODO : update cache
          break;
        case 'cache':
        case 'inmemory':
        case 'redis':
          break;
      }
    }

    /**
     * Perform connect for every clustered DB
     *
     * @method
     */
    connect( pOptions:any  = {}):boolean{
        // nothing to do
        this.db = new CacheDb(this);
        // connect clustered node
        this.cluster.map((vConn)=>{
          if(vConn.connect(pOptions)){
            if(vConn.getDB().supportsEvent()){
              vConn.getDB().onEvent$.subscribe(this.clusterEventsListener);
            }
          }
        });

        console.log("[*] Connected to cache DB");
        // subscribe
        return true;
    }





    /**
     * empty
     *
     * @method
     */
    close():boolean{
        // nothing to do
        return true;
    }

    /**
     * To get an index by its name
     * @param pName
     */
    getIndex( pName:string, pNodeType?:NodeType):Index{
        if(this.db == null){
          throw CacheException.NULL_DB_INSTANCE();
        }

        return this.db.getIndex(pName,pNodeType);
    }

  /**
   * To get a collection by its name
   *
   * @param {string} pName
   */
    getCollection( pName:string, pNodeType?:NodeType):Collection{
      if(this.db == null){
        throw CacheException.NULL_DB_INSTANCE();
      }

      return this.db.getCollection(pName,pNodeType);
    }

  /**
   * To create a new tempory database
   *
   * This is mainly used as buffering
   *
   * @param pName
   */
  newTemporaryDb(pName: string): IDatabase {
        this.tmpDbs[pName] = new CacheDb(this);

        return (this.tmpDbs[pName] as IDatabase);
    }

    clearTemporaryDb( pName:string):void{
        this.tmpDbs[pName] = null;
    }

    /**
     * To get DB instance
     * @method
     */
    getDB():IDatabase{
        if(this.db == null){
          throw CacheException.NULL_DB_INSTANCE();
        }
        return this.db;
    }

    /**
     * To get adapter/db type
     *
     * @return {string}
     * @method
     */
    getType(): string {
        return this.type;
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     * @static
     */
    static getProperties():any {
        let o:any = {};

        o.type = TYPE;
        o.name = NAME;
        o.description = DESC;

        return o;
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     */
    toJsonObject():any{
        return CacheConnector.getProperties();
    }
}

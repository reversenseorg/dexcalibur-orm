'use strict';

import {ElasticDb, } from "./ElasticDb";
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "../../DbAbstraction";
import {IAppContext} from "../../IAppContext";
import {ConnectorBasicAuth, ConnectorOptions} from "../../ConnectorFactory";
import { ElasticException } from "./ElasticException";

import { Client, ClientOptions } from "@elastic/elasticsearch";
import {ElasticsearchClient, ElasticsearchClientConfig } from "@kbn/core/server";

import { NodeType } from "../../NodeType";



const TYPE = 'elastic';
// @ts-ignore
const NAME = 'ElasticSearch';
// @ts-ignore
const DESC = 'Data are stored in an elastic.';

interface ElasticDatabaseInstanceList {
  [name: string]: ElasticDb
}

export interface IndexMapping {
  [ormIndex:string] :string[];
}


export interface ElasticConnectorOptions extends ConnectorOptions {
  clusterClient?: boolean,
  clusterConfig?: ElasticsearchClientConfig,
  clientConfig?: ClientOptions
}
/**
 * Represents a SQLite file-based database
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class ElasticConnector implements IDatabaseAdapter {

  static UUID = TYPE;

  ctx: IAppContext;
  options: ElasticConnectorOptions;
  type: string = TYPE;
  db: ElasticDb|null = null;
  tmpDbs: ElasticDatabaseInstanceList = {};

  _client:ElasticsearchClient;

  /**
   * To create a new DB
   *
   * @param {DexcaliburProject} pContext The project associated to this database
   * @return {ElasticDb}
   * @constructor
   */
  constructor(pContext: IAppContext, pOptions: ElasticConnectorOptions = {}) {
    this.ctx = pContext;
    this.options = pOptions;
  }


  getType(): string {
    return this.type;
  }

  /**
   * To retrieve mapping between elastic index name and node type
   *
   * Warning : A node type can be stored into multiple index
   *
   *
   * @return {IndexMapping}
   */
  getMapping():IndexMapping {
    return this.options.mapping;
  }


  /**
   * Elastic DB has not sub connector
   * Not supported.
   *
   * @param {string} pName
   */
  getSubConnector(pName:string):IDatabaseAdapter|null{
    // not supported
    return null;
  }

  /*
   * An index pattern must hase the  same syntax than an elastic pattern
   *
   * Chainable
   *
   * @param {string} pCollectionName The collection/index name in ORM
   * @param {string} pIndexPattern A pattern matching the elastic indexes
   * @return {ElasticConnector}
   * @method
   */
  /*
  addIndicesMapping(pCollectionName: string, pIndexPattern: string) {
    const mapping =  this.getMapping();
    if(mapping[pCollectionName]==null){
      mapping[pCollectionName] = [];
    }
    mapping[pCollectionName].push(pIndexPattern);
    return this;
  }*/


  /**
   * To verify if a DB exists
   * @returns {boolean}
   */
  exists(): boolean {
    if(this._client != undefined){
      if(this.options.clusterClient){
        return (this._client != null);
      }else{
        return (this._client != null);
      }
    }else{
      return false;
    }
  }

  /**
   * Nothing to do here
   *
   * @returns {boolean}
   */
  create(): boolean {
    return true;
  }

  /**
   * To authenticate and connect to Elastic server.
   *
   *
   * @method
   */
  connect(pAuth:ConnectorBasicAuth|null = null): ElasticDb {

    const userCtx:any = (this.ctx as any).getUserContext();
    if(userCtx != null && userCtx.client != null){
      console.log("[*] Connecting with user credentials");
      console.log(userCtx.client);
      this._client = userCtx.client;
    }else{
      console.log("[*] Connecting with internal credentials");
      if(this.options.clusterClient){
        if(this.options.clusterConfig == null || (this.options as any).coreStart==null){
          throw ElasticException.CLUSTER_CLIENT_NOT_CONFIGURED();
        }

        this._client = (this.options as any).coreStart.elasticsearch.createClient('forensoc-srv-cache',this.options.clusterConfig).asInternalUser;

      }else{
        if(this.options.clientConfig == null){
          throw ElasticException.BASIC_CLIENT_NOT_CONFIGURED();
        }
        this._client = new Client(this.options.clientConfig);
      }
    }




    this.db = new ElasticDb(this);

    // load indexes
    this.db.loadIndexes();

    console.log("[*] Connected to Elastic DB");
    return this.db;
  }


  /**
   * To close the connection
   *
   * Not supported
   *
   * @method
   */
  close(): boolean {
    // nothing to do
    return true;
  }

  /**
   * To get an index by name
   *
   * @param pName
   * @param pType
   */
  getIndex(pName: string, pType:NodeType): IDbIndex {
    return this.getDB().getIndex(pName, pType);
  }

  getCollection(pName: string, pType:NodeType): IDbCollection {
    return this.getDB().getCollection(pName, pType);
  }

  getMappedCollection(pIndexPattern:string, pName: string, pType:NodeType): IDbCollection {
    return this.getDB().getCollection(pName, pType);
  }

  newTemporaryDb(pDbName: string): IDatabase {
    return (this.tmpDbs[pDbName] = new ElasticDb(this)) as IDatabase;
  }

  clearTemporaryDb(pName: string): void {
    delete this.tmpDbs[pName];
  }

  getDB(): IDatabase {
      if(this.db == null){
        throw ElasticException.NULL_DB_INSTANCE();
      }

      return (this.db as IDatabase);
  }

  getClient():ElasticsearchClient {
    return this._client;
  }

  /**
   * To transform current DB into a simple object ready to be serialized
   *
   * @returns {Object}
   * @method
   */
  toJsonObject(): any {
    // not supported
    return {};
  }
}

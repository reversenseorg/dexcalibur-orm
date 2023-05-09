/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import {DbSetType, IDbCollection} from "../../../orm/DbAbstraction";
import {NodeProperty} from "../../../orm/NodeProperty";
import {ElasticAPI} from "./ElasticAPI";
import {ElasticException} from "./ElasticException";
import {NodeType} from "../../../orm/NodeType";
import * as Log from "../../../utils/Logger";
import {ElasticDb} from "./ElasticDb";
import {ObjType, OpCode} from "../../DbEvent";
import {estypes} from '@elastic/elasticsearch'
import {Comparison, Operation, OperationType, SearchRequest} from "../../../../search/SearchRequest";
import {INode} from "../../../orm/INode";
import {ApplicationDatabase} from "../../ApplicationDatabase";
import {SearchRequestCondition} from "../../../../search/SearchRequestCondition";
import { DeleteResponse } from "@elastic/elasticsearch/lib/api/types";
import {CacheStore} from "../cache/CacheStore";

const Logger: Log.Logger = Log.newLogger() as Log.Logger;

export interface ListOptions {
  exclude: any[];
  size?: number;
}

export interface ElasticUpdateOptions {
  retrieveSource?: boolean;
  subset?: string[];
}

export default class ElasticDbCollection implements IDbCollection {
  static __type: string = DbSetType.COLL;
  name: string;

  private _idxName: string[] = [];

  private _cache: any;

  private _c = 0;
  values: any = {};
  private _tpl: NodeType;
  private _extra: any = {};
  private _s: ElasticAPI;
  public _db: ElasticDb;


  /**
   * To create a new instance
   *
   * @param {String} name
   * @constructor
   */
  constructor(pApi: ElasticAPI, name: string[], pTpl: NodeType) {
    this._idxName = name;
    this._tpl = pTpl;
    this._s = pApi;
    this._c = 0;
  }


  hasCache():boolean {
    return this._cache!=null;
  }

  getCache():CacheStore {
    if(this._cache==null) throw new Error("The collection has not cache.");
    return this._cache
  }


  /**
   * To change current DB
   * @param pDB
   */
  setDB(pDB: ElasticDb): any {
    this._db = pDB;
    return this;
  }

  /**
   * To keep  a trace of collection linked to the current collection
   *
   * @param {ElasticDbCollection} pColl
   * @method
   */
  link(pColl: ElasticDbCollection): void {
    this._extra[pColl.name] = pColl;
  }

  getExtra(pName: string): ElasticDbCollection {
    return this._extra[pName];
  }

  setEntry(key: any, value: any, pOptions: any = {force: false}):any {
    throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.setEntry() : async is mandatory");
  }

  addEntry(key: string, value: any): any {
    throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.addEntry() :  async is mandatory");
  }

  getEntry(key: any): any {
    throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.getEntry() :  async is mandatory");
  }

  updateEntry(pEntry: any): boolean {
    throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.updateEntry() :  async is mandatory");
  }

  removeEntry(key: any): boolean {
    throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.removeEntry() :  async is mandatory");
  }


  /**
   * To check if an entry exists for the specified key
   *
   * By default it filters by primary key
   *
   * @param {any} pKey Key value
   * @return {boolean} Return TRUE is an entry exists, else FALSE
   * @method
   * @since 1.0.0
   */
  hasEntry(pKey: any): boolean {
    // throw ElasticException.NOT_SUPPORTED("ElasticDbCollection.removeEntry() :  async is mandatory");

    return false;
  }

  async asyncAddEntry(key: any, pEntry: any, pOptions: any = {force: false}):Promise<any> {

    console.log(`[ElasticDbCollection] asyncAddEntry [key=${key}][collection=${this.name}][indexes=${this._idxName.concat(':')}] `);

    if (this._idxName.length != 1) {
      throw ElasticException.CANNOT_CRUD_ON_WILDCARD_INDEX(this.name, this._idxName);
    }

    const val = pEntry.toJsonObject();

    // prevent conflict on internal UID
    if(val.hasOwnProperty('_id')) delete val._id;



    const preparedObj = this._s.prepareForPersist(pEntry, this._tpl, pOptions.subset ? pOptions.subset : []);

    console.log(preparedObj);
    const fresh: estypes.IndexResponse = await this._s._client.index({
      index: this._idxName[0],
      document: preparedObj
    });

    if(fresh.result==='created' && fresh._id != null){
      console.log("[ElasticDbCollection] setEntry (await) > ", await fresh);

      pEntry._id = fresh._id;

      this._db.newEvent({
        operation: OpCode.CREATE,
        objtype: ObjType.DOCUMENT,
        uid: fresh._id,
        obj: pEntry,
        result: fresh
      });

      return pEntry;
    }else{
      throw ElasticException.CANNOT_INSERT_OBJECT(this._tpl.getName(), key);
    }
  }
  /**
   * To recover non volatile links broken by persistence
   *
   * @param pData
   * @private
   */
  async _relink(pNode: any): Promise<INode> {

    const appDB: ApplicationDatabase = this._db.conn.ctx.getDomain().getDB();
    let tmpMult: INode[] = [];
    //const wrapHost = this._tpl.isWrapping()? this._tpl.getWrapHost() : null;

    this._tpl.getProperties().map((vPpt: NodeProperty) => {
      if (vPpt.hasWakeUp()) {
        //Logger.raw(JSON.stringify(o[vPpt.getName()]));
        //Logger.raw(vPpt.getName());
        pNode[vPpt.getName()] = vPpt.doWakeUp({
          self: pNode,
          ctx: this._db.conn.ctx,
          p: pNode[vPpt.getName()]
        })
      } else if (!vPpt.isVolatile() && vPpt.isSerialized()) {
        pNode[vPpt.getName()] = this._s._unserializeProperty(pNode, vPpt);
      }
    });

    if (this._tpl.hasLinks()) {
      const lks: NodeProperty[] = this._tpl.getLinks();

      for (let i = 0; i < lks.length; i++) {
        const vPpt = lks[i];

        if (vPpt.isMultiple()) {
          tmpMult = [];
          const ids = pNode[vPpt.getName()];

          //console.log(vPpt.getNodeType().getName(),ids);
          if(ids!=null && Array.isArray(ids)){
            for (let k = 0; k < ids.length; k++) {
              if(ids[k]!=null){
                const o = await appDB.asyncSearchNode(vPpt.getNodeType().getType(), ids[k]);
                if (o != null) tmpMult.push(o);
              }
            }
          }
          pNode[vPpt.getName()] = tmpMult;
        } else {
          if( pNode[vPpt.getName()] != null){
            pNode[vPpt.getName()] = await appDB.asyncSearchNode(vPpt.getNodeType().getType(), pNode[vPpt.getName()]);
          }else{
            pNode[vPpt.getName()] = vPpt.getDefaultValue();
          }

        }
      }

    }


    return await pNode;
  }

  async getAsList(pLimit:number = -1, pOptions:ListOptions = {exclude:[]}): Promise<any[]> {
    return await this.getAll(pLimit,pOptions);
  }

  /**
   * To read all entries from the collection and instanciate node
   *
   * If this `getAll()` is forced, cache will be overrided causing data loss
   * of non saved data.
   *
   * @param {boolean} pList If TRUE, then it returns an array, else it returns an object indexed by primary key value
   * @param {boolean} pForce If TRUE, all entries are retrieved from DB, else, cached entries are agregated with entry from DB
   * @return {any|any[]} List or hashmap of entries
   * @method
   * @since 1.0.0
   */
  async getAll(pSize:number = 100, pOptions: ListOptions = {exclude:[] }): Promise<any> {

    const all: any[] = [];
    let res: estypes.SearchResponse;

    const extraConf:any = {};
    if(pSize>0) extraConf.size = pSize;

    for (let i = 0; i < this._idxName.length; i++) {
      res = await this._s._client.search({
        index: this._idxName[i],
        query: {
          term: {
            "__": this._tpl.getType()
          }
        },
        ...extraConf
      });


      const hits = (await res).hits.hits;



      if(this._tpl.isWrapping()){
        let d:any = {};
        for (let k = 0; k < hits.length; k++) {

          // if(pOptions.exclude)
          d[ this._tpl.getWrapHost() ] = hits[k]._source;
          const obj = new (this._tpl.getBuilder())(d);
          if (this._tpl.getPrimaryKey().getName() === '_id') {
            obj._id = hits[k]._id;
          }
          if(pOptions.exclude.indexOf(obj._id)==-1){
            all.push(await this._relink(obj));
          }
        }
      }else{
        for (let k = 0; k < hits.length; k++) {
          const obj = new (this._tpl.getBuilder())(hits[k]._source);
          if (this._tpl.getPrimaryKey().getName() === '_id') {
            obj._id = hits[k]._id;
          }
          if(pOptions.exclude.indexOf(obj._id)==-1){
            all.push(await this._relink(obj));
          }
        }
      }

    }

    if ((await all).length > 0) {
      console.log("[ElasticDbCollection] list() : ", all);
    } else {
      console.log("[ElasticDbCollection] list() of '" + this._tpl.getName() + "' is empty : ");
    }


    return all;
  }


  /**
   *
   * @param pList
   * @param pForce
   * @param pOptions
   */
  async asyncGetEntry(pKey:any, pOptions: any = {size: 100}): Promise<any> {

    let o:INode|null = null;
    let res: estypes.GetResponse;

    for (let i = 0; i < this._idxName.length; i++) {
      res = await this._s._client.get({
        index: this._idxName[i],
        id: pKey as string
      });


      if(res != null && res._source != null){
        o = new (this._tpl.getBuilder())(res._source);
        if (this._tpl.getPrimaryKey().getName() === '_id') {
          (o as INode)._id = res._id;
        }
        o = await this._relink(o);
      }
    }

    // @ts-ignore
    if (await o != null) {
      // @ts-ignore
      console.log("[ElasticDbCollection] asyncGetEntry() : ", o);
    } else {
      console.log("[ElasticDbCollection] asyncGetEntry() of '" + this._tpl.getName() + "' is empty : ");
    }


    return o;
  }

  /**
   * To execute a function for each entry
   *
   * Same as map function over an array
   *
   * @param {function} pFn The callback function
   * @method
   * @since 1.0.0
   */
  map(pFn: any) {
    ( async ()=>{
      (await this.getAll(true)).map((k: any, i: number) => {
        pFn(i, k)
      });
    })();
  }


  /*
      asyncHasEntry(pKey:any):Observable<boolean>{

        if(this._idxName.length!=1){
          throw ElasticException.CANNOT_CRUD_ON_WILDCARD_INDEX(this.name, this._idxName);
        }

        let exists=false;
        this._idxName.map( (vIdx:string)=>{
          exists = exists || await this._s._client.exists({
            index: vIdx,
            id: (typeof pKey === 'object')? pKey.getUID() : pKey
          })
        })

        return exists;
      }*/

  async asyncHasEntry(pKey: any): Promise<boolean> {

    if (this._idxName.length != 1) {
      throw ElasticException.CANNOT_CRUD_ON_WILDCARD_INDEX(this.name, this._idxName);
    }

    let exists = false;
    this._idxName.map(async (vIdx: string) => {
      exists = exists || await this._s._client.exists({
        index: vIdx,
        id: (typeof pKey === 'object') ? pKey.getUID() : pKey
      })
    })

    return exists;
  }



  private _requestOperationToQuery( pOpe:Operation[], pQuery:any, pCurrentPhase:number, pMaxPhases:number):any {

    let query:any = pQuery;
    let ope:Operation;
    let cond:SearchRequestCondition;
    let comp:string = "-";

    const hasShould = (pQuery.query.bool.should != null);

    let ranges:any = {};
    let range:any;

    for (let i = 0; i < pOpe.length; i++) {
      ope = pOpe[i];
      comp = "-";
      switch (ope.type) {
        case OperationType.FILTER:
          comp = "filter";
          // break is removed intentionally because filter and search have same syntax
        case OperationType.SEARCH:
          cond = ope.args.pattern;

          console.log(JSON.stringify(cond));
          // TODO : add not()
          if(comp==="-"){
            comp = cond.isNotMatch()? "must_not" : "must";
          }


          if(!pQuery.query.bool.hasOwnProperty(comp)){
            pQuery.query.bool[comp] = [];
          }

          if(cond.isQueryString()){
            pQuery.query.bool[comp].push({ query_string:
                { query: cond.getRaw() }
            });
          }

          if(cond.hasPattern()){
            if (cond.isStrict()) {
              pQuery.query.bool[comp].push({ term:
                  { [cond.field as string]: cond.pattern }
              });
            }else if (cond.isRegExp()) {
              pQuery.query.bool[comp].push({ regexp:
                  { [cond.field as string]: cond.pattern }
              });
            }
            else{
              pQuery.query.bool[comp].push({ match:
                  { [cond.field as string]: cond.pattern }
              });
            }
          }
          else{
            if (cond.isRange()) {
              pQuery.query.bool[comp].push({ term:
                  { [cond.field as string]: cond.getRange() }
              });
            }
          }

          if (cond.tag != null) {
            pQuery.query.bool[comp].push({ term:
                { tags: cond.tag._uid }
            });
          }

          break;

        case OperationType.AGGR:
          if (pQuery.aggs == null) {
            pQuery.aggs = {};
          }

          const ag:any = { terms: { field: ope.args.on }}

          if(ope.args.size != null){
            ag.terms.size = ope.args.size;
          }

          pQuery.aggs[ope.args.opts.alias] = ag;
          break;

        case OperationType.SIZE:
          if(ope.args.limit != null){
            pQuery.size = ((typeof ope.args.limit === 'string')? parseInt(ope.args.limit) : ope.args.limit);
          }
          else if (ope.args.offset != null){
            pQuery.from = ((typeof ope.args.offset === 'string')? parseInt(ope.args.offset) : ope.args.offset);
          }
            break;


          case OperationType.UNION:
            if(pQuery.size==null){

              let nestedReq:SearchRequest = (ope.args.request as SearchRequest);
              let nestedQuery: any = { query: { bool: { must: [] }} };
              const nestedPhases = nestedReq.getPhases();

              for (let k=0; k<nestedPhases.length; k++){
                nestedQuery = this._requestOperationToQuery(nestedPhases[k], nestedQuery, k, nestedPhases.length);

              }


              console.log("[ELASTIC DB COLLECTION][SEARCH] NestedQuery : ",JSON.stringify(nestedQuery));

              pQuery = {
                query: {
                  bool: {
                    should: [
                      { bool: pQuery.query.bool },
                      { bool: nestedQuery.query.bool }
                    ]
                  }
                }
              };

              //pQuery.query.bool.should.push( nestedQuery.query.bool );
          }
          //pQuery.query.bool.must.push();
          break;

        case OperationType.TIME:
            if(ranges[ope.args.field]==null){
              range = ranges[ope.args.field] = {}
            }else{
              range = ranges[ope.args.field];
            }

            switch (ope.args.comparison){
              case Comparison.LTE:
                range.lte = ope.args.date; //(new Date(ope.args.date)).toDateString();
                break;
              case Comparison.GTE:
                range.gte = ope.args.date; // (new Date(ope.args.date)).toDateString();
                break;
              case Comparison.LT:
                range.lt = ope.args.date; // (new Date(ope.args.date)).toDateString();
                break;
              case Comparison.GT:
                range.gt = ope.args.date; // (new Date(ope.args.date)).toDateString();
                break;
              case Comparison.EQ:
                pQuery.query.bool.must.push({ match:
                    { [ope.args.field]: ope.args.date }
                });
                break;
            }
          break;
      }
    }


    if(Object.keys(ranges).length> 0){
      const o:any = { range : {} };
      for(let k in ranges){
        o.range[k] = ranges[k] ;
      }
      pQuery.query.bool.must.push(o);
    }

    return pQuery;
  }

  /**
   * To build a DSL query
   *
   * @param pRequest
   * @param pOptions
   * @method
   */
  async search(pRequest: SearchRequest, pOptions: any = {outIndex: null}):Promise<any> {

    let query: any = { query: { bool: { must: [] }} };

    const phases = pRequest.getPhases();


    for (let k=0; k<phases.length; k++){
      query = this._requestOperationToQuery(phases[k], query, k, phases.length);

    }

    console.log("[ELASTIC DB COLLECTION][SEARCH] Query : ",JSON.stringify(query));

    const res:any = await this._s._client.search(query);
    const all:any[] = [];


    if(await res?.hits?.hits != null){

      console.log("[ELASTIC DB COLLECTION][SEARCH] res : ",res);
      const hits = (await res).hits.hits;

      if(this._tpl.isWrapping()){
        let d:any = {};
        for (let k = 0; k < hits.length; k++) {
          d[ this._tpl.getWrapHost() ] = hits[k]._source;
          const obj = new (this._tpl.getBuilder())(d);
          if (this._tpl.getPrimaryKey().getName() === '_id') {
            obj._id = hits[k]._id;
          }
          all.push(await this._relink(obj));
        }
      }else{
        for (let k = 0; k < hits.length; k++) {
          const obj = new (this._tpl.getBuilder())(hits[k]._source);
          if (this._tpl.getPrimaryKey().getName() === '_id') {
            obj._id = hits[k]._id;
          }
          all.push(await this._relink(obj));
        }
      }

    }


    console.log("[ELASTIC DB COLLECTION][SEARCH] size : ",await all.length);
    return await all;
  }



  /**
   * To update a document
   *
   * @param pEntry
   */
  async asyncUpdateEntry(pEntry: any, pOptions: ElasticUpdateOptions = {}): Promise<boolean> {

    let res: estypes.UpdateResponse;
    let success = true;

    for (let i = 0; i < this._idxName.length; i++) {
      const preparedObj = this._s.prepareForPersist(pEntry, this._tpl, pOptions.subset ? pOptions.subset : []);
      console.log(`[ElasticDbCollection] asyncUpdateEntry() [obj=${pEntry._id}][idx=${this._idxName[i]}] \n ${JSON.stringify(pEntry)} \n ${JSON.stringify(preparedObj)}`);
      res = await this._s._client.update({
        id: pEntry._id,
        index: this._idxName[i],
        _source: true,
        doc: preparedObj,
        doc_as_upsert: true
      });
      console.log(`[ElasticDbCollection] asyncUpdateEntry() [res=${await res.result}]`);
      success = success && (await res.result == 'updated');
    }

    return success;
  }


  /**
   *
   * @param key
   */
  async asyncRemoveEntry(pKey: any): Promise<boolean> {

    if (this._idxName.length != 1) {
      throw ElasticException.CANNOT_CRUD_ON_WILDCARD_INDEX(this.name, this._idxName);
    }

    if(pKey===null || pKey===undefined){
      throw ElasticException.DELETE_FAILURE_DOCID_NULL();
    }

    let res:DeleteResponse;
    let success = false;
    try {

      for (let i = 0; i < this._idxName.length; i++) {
        console.log(`[ElasticDbCollection] asyncRemoveEntry() [obj=${pKey}][idx=${this._idxName[i]}] `);
        res = await this._s._client.delete({
          id: pKey,
          index: this._idxName[i],
        });
        console.log(`[ElasticDbCollection] asyncRemoveEntry() [res=${await res.result}]`);
        success = success || (await res.result == 'deleted');
      }


    } catch (err) {
      Logger.error('[ELASTIC] Remove entry failed : ', err.message);
    }

    return success;
  }

  isCollection() {
    return true;
  }

  isIndex(): boolean {
    return false;
  }

  size(): number {
    return this._c;
  }


  toJsonObject(): any {
    let o: any = {};

    o.name = this.name;
    o._c = this._c;
    o.values = {};
    for (let i in this.values) {
      if (typeof this.values[i].toJsonObject === 'function')
        o.values[i] = this.values[i].toJsonObject();
      else
        o.values[i] = this.values[i];
    }

    return o;
  }

  // ======= serialize =======

  isSerializable(): boolean {
    return false;
  }

  static unserialize(serialized_obj: any): IDbCollection {
    throw  new ElasticException("SqliteDbCollection  are not unserializable");
  }

  serialize(): any {
    throw  new ElasticException("SqliteDbCollection  are not serializable");
  }
}

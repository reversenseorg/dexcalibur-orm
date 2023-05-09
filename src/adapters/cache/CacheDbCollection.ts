/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "../../../orm/DbAbstraction";
import {CacheEntry, CacheStore} from "./CacheStore";
import {NodeType} from "../../../orm/NodeType";
import {IndexCachePolicy} from "./CachePolicy";
import {CacheException} from "./CacheException";
import {Comparison, Operation, OperationType, SearchRequest} from "../../../../search/SearchRequest";
import {SearchRequestCondition} from "../../../../search/SearchRequestCondition";


interface CacheSearchResult {
  completed: boolean;

  results: any[];

  newLimit:number;
}
/**
 * @class
 */
export default class CacheDbCollection implements IDbCollection
{
    static __type:string = "Collection";

    name:string;
    ctr:number = 0;
    values:any = {};

    _extConn:IDatabaseAdapter;
    _type:NodeType;
    _db:IDatabase;
    _cache:CacheStore|null;
    _backend: IDbCollection|null = null;

  /**
   * Allocate the store where data will be buffered
   *
   * @param name
   * @param pNodeType
   * @param pPolicy
   */
    constructor(name:string = "", pDB:IDatabase, pNodeType:NodeType, pPolicy:IndexCachePolicy|null = null ){
        this.name = name;
        this.ctr = 0;
        this._db = pDB;
        this._type = pNodeType;

        // get connector associated to DB where data should be persisted
        this._extConn = this._db.conn?.getSubConnector( this._type.getDataSource().name) as IDatabaseAdapter;

        if(this._extConn==null){
          throw CacheException.COLL_CANNOT_BE_PERSISTED();
        }

        if(pPolicy!=null){
          this._cache = new CacheStore(pPolicy);
        }
    }

    hasCache():boolean {
      return this._cache!=null;
    }

    getCache():CacheStore {
      if(this._cache==null) throw new Error("The collection has not cache.");
      return this._cache
    }


    setPersistBackend( pColl:IDbCollection):void {
      this._backend = pColl;
    }

  /**
   * To create a new object into db
   *
   * Important : cache must be updated only on success, else
   * object without UID will be returned instead of persisted object.
   *
   * @param key
   * @param value
   */
    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this.ctr++;
        }

        /* TODO : buffer write operation => make bulk request from cache
        if(this._cache.isOperationBuffered(OPE.CREATE_DATA)){
          this._cache?.addEntry(value);
        }else{
        */
        // write data
        this._extConn.getCollection(this.name, this._type).addEntry(key, value);

        // if write successful, then we update the cache
        this._cache?.addEntry(value);

        this.values[key] = value;
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }


  /**
   *
   * @param pKey
   * @param pObject
   * @async
   */
    async asyncAddEntry( pKey:string, pObject:any):Promise<any> {

      let e:any;

      const coll = this._extConn.getCollection(this.name, this._type);
      if(coll.asyncAddEntry!=null){
        console.log(`[CacheDbCollection] asyncAddEntry() [key=${pKey}][obj=${pObject}]`);
        e = await coll.asyncAddEntry(pKey, pObject);
      }else{
        console.log(`[CacheDbCollection] addEntry() [key=${pKey}][obj=${pObject}]`);
        e = coll.addEntry(pKey, pObject);
      }

      if(e != null && e[this._type.getPrimaryKey().getName()]!=null){
        if(this._cache!=null){
          this._cache.updateEntry((vEntry:CacheEntry)=>{
            return (vEntry.value.getUID() === e.getUID());
          }, e);
        }

        return e;
      } else{
        throw CacheException.CANNOT_INSERT_OBJECT(this._type.getName(), pKey);
      }
    }

  /**
   * To update an entry
   *
   * TODO : implement cache
   *
   * Depending on cache policy, there are 2 ways :
   * - direct update in elastic/db, update cache on success
   * - update cache, and prepare bulk request
   *
   * @param {INode} value
   * @method
   */
  updateEntry(value:any):any{
    // write data
    const e = this._extConn.getCollection(this.name, this._type).updateEntry(value);

    // if write successful, then we update the cache
    if(e == true && this._cache!=null){
      this._cache.updateEntry((vEntry:CacheEntry)=>{
        return (vEntry.value.getUID()===value.getUID());
      }, value);
    }
  }

  /**
   * To perform asynchronous update of a document
   *
   * TODO : implement cache
   *
   * Depending on cache policy, there are 2 ways :
   * - direct update in elastic/db, update cache on success
   * - update cache, and prepare bulk request
   *
   * @param pObject
   * @param pOptions
   * @method
   * @async
   */
  async asyncUpdateEntry( pObject:any, pOptions:any = {}):Promise<boolean> {

    let e:any;

    const coll = this._extConn.getCollection(this.name, this._type);
    if(coll.asyncUpdateEntry!=null){
      console.log(`[CacheDbCollection] asyncUpdateEntry() [obj=${pObject}]`);
      e = await coll.asyncUpdateEntry(pObject,pOptions);
    }else{
      console.log(`[CacheDbCollection] updateEntry() [obj=${pObject}]`);
      e = coll.updateEntry(pObject,pOptions);
    }

    if(e == true && this._cache!=null){
      this._cache.updateEntry((vEntry:CacheEntry)=>{
        return (vEntry.value.getUID()===pObject.getUID());
      }, pObject);
    }

    return e;
  }



    getEntry( pKey:string, pOptions:any = {}):any {

      let e:any;
      if(this._cache!=null && this._cache.isNotEmpty()){
          let entry = this._cache?.getEntry((vEntry:CacheEntry)=>{
            return (vEntry.value.getUID()===pKey);
          });
          e = entry.value;
      }else{
          e = this._extConn.getCollection(this.name, this._type).getEntry(pKey, pOptions);
      }

      return e;
    }

    async asyncGetEntry( pKey:string, pOptions:any = {}):Promise<any> {

      let e:any;
      if(this._cache!=null && this._cache.isNotEmpty()){
        let entry = this._cache?.getEntry((vEntry:CacheEntry)=>{
          if(vEntry==null) return false;
          return (vEntry.value._id===pKey);
        });
        if(entry==null){
          const coll = this._extConn.getCollection(this.name, this._type);
          if(coll.asyncRemoveEntry!=null){
            e = await coll.asyncGetEntry(pKey,pOptions);
          }else{
            e = coll.getEntry(pKey,pOptions);
          }
        }else{
          e = entry.value;
        }
      }else{
        const coll = this._extConn.getCollection(this.name, this._type);
        if(coll.asyncRemoveEntry!=null){
          e = await coll.asyncGetEntry(pKey,pOptions);
        }else{
          e = coll.getEntry(pKey,pOptions);
        }

      }

      return e;
    }



  /**
   * To get all entry as a list
   *
   * @param {number} pLimit The number of entries to read, -1 for no limit
   * @param pOptions
   */
    async getAsList(pLimit:number = -1, pOptions:any = {}):Promise<any[]> {

      let list:any[] = [];
      let tmp:any = [];
      let arr:any = [];

      // if there is enough in the cache
      console.log(`[CacheDbCollection] getAsList() [limit=${pLimit}][_cache=${this._cache !=null}]`);
      if(pLimit>-1 && this._cache !=null){

        const cacheSize = this._cache.countEntry();
        console.log(`[CacheDbCollection] getAsList() [cacheSize=${cacheSize}]`);
        if(pLimit < cacheSize){
          arr = this._cache.getAll(pLimit);
        }else{
          arr = this._cache.getAll();
          const excl:string[]=[];
          arr.map((x:any) => excl.push(x.getUID()));

          // ne pas include ce qui est en cache
          tmp = await this._extConn.getCollection(this._type.getName(), this._type).getAsList(pLimit-cacheSize, {exclude:excl});
          this._cache.addEntries(tmp);

          arr = arr.concat(tmp);
        }
      }else{
        // limit==-1 is equivalent to no cache
        arr = await this._extConn.getCollection(this._type.getName(), this._type).getAsList();

        if(this._cache!=null){
          this._cache.flush();
          this._cache.addEntries(arr);
        }

      }

      console.log("Cache DB : ", await arr);


      return await arr;
    }

    getAll(pOptions:any = {}):any{
        return this._extConn.getCollection(this.name, this._type).getAll();
    }

    hasEntry(key:string):boolean{
      // chercher d'abord dans le cache
      return this._extConn.getCollection(this.name, this._type).hasEntry(key);
    }

    async asyncHasEntry(key:string):Promise<boolean>{

      const coll = this._extConn.getCollection(this.name, this._type);

      if(coll.asyncHasEntry!=null){
        // chercher d'abord dans le cache
        return await coll.asyncHasEntry(key);
      }else{
        // chercher d'abord dans le cache
        return coll.hasEntry(key);
      }

    }

    map(fn:any, pOptions:any = {}){
        for(let k in this.values){
            fn(k,this.values[k]);
        }
    }

    isCollection(){
        return true;
    }

    isIndex():boolean{
        return false;
    }

    size():number{
      return this._extConn.getCollection(this.name, this._type).size();
    }


    removeEntry(key: any, pOptions:any = {}): boolean {

      let success = false;

      success = success && this._extConn.getCollection(this.name, this._type).removeEntry(key,pOptions);

      // remove from cache + bulk
      if(this._cache!=null && this._cache.isNotEmpty() && success){
        this._cache?.removeEntry((vEntry:CacheEntry)=>{
          return (vEntry.value.getUID()===key);
        });
      }

      return success;
    }

    async asyncRemoveEntry(key: any, pOptions:any = {}):Promise<boolean> {

      let success = false;

      // remove from DB
      const coll = this._extConn.getCollection(this.name, this._type);
      if(coll.asyncRemoveEntry!=null){
        console.log(`[CacheDbCollection] asyncRemoveEntry() [obj=${key}]`);
        success = success || await coll.asyncRemoveEntry(key,pOptions);
      }else{
        console.log(`[CacheDbCollection] asyncRemoveEntry() [obj=${key}]`);
        success = success || coll.removeEntry(key,pOptions);
      }

      // remove from cache + bulk
      if(this._cache!=null && this._cache.isNotEmpty() && success){
        this._cache.removeEntry((vEntry:CacheEntry)=>{
          console.log("asyncRemoveEntry / cache / invalidate ? :", vEntry.value.getUID(),key,vEntry.value.getUID()===key);
          return (vEntry.value.getUID()===key);
        });
      }

      return success;
    }


    private _createComparisonFunction(pOperations:Operation[]):((pData:any)=>boolean) {


      return (vData:any)=>{

        console.log(vData);

        let i = 0;
        let op:Operation;
        let match = true;
        const fields = vData.fields;
        while(i < pOperations.length){
          op = pOperations[i];
          switch (op.type){
            case OperationType.FILTER:
            case OperationType.SEARCH:
              if(op.args.opts.strict){
                match = match && (vData === op.args.pattern);
              }else{
                match = match && (op.args.pattern as SearchRequestCondition).test(vData);
              }
              break;
            case OperationType.TIME:


              switch (op.args.comparison){
                case Comparison.LTE:
                  match = match && ((new Date(fields[op.args.field ])).getTime() <= op.args.date);
                  break;
                case Comparison.GTE:
                  match = match && ((new Date(fields[op.args.field ])).getTime() >= op.args.date);
                  break;
                case Comparison.LT:
                  match = match && ((new Date(fields[op.args.field ])).getTime() < op.args.date);
                  break;
                case Comparison.GT:
                  match = match && ((new Date(fields[op.args.field ])).getTime() > op.args.date);
                  break;
                case Comparison.EQ:
                  match = match && ((new Date(fields[op.args.field ])).getTime() == op.args.date);
                  break;
              }
              break;
            default:
              // stop comparison : that means non-compressible operation has been reach (aggregation, filter, limit, ...)
              i = pOperations.length;
              break;
          }
        }
        return match;
      }
    }

    private _searchInCacheStore( pRequest:SearchRequest, pResult:IDbIndex):CacheSearchResult {

      const result:CacheSearchResult = {
        completed: true,
        results: [],
        newLimit: -1
      };

      // search is line in cache satisfies the request
      if(this._cache!=null && this._cache.isNotEmpty()){

        const cache = this._cache as CacheStore;
        const phases = pRequest.getPhases();
        let matchFn:(v:any)=>boolean;

        // walk over cache
        let phaseRes:any[] = [cache.getAll()];

        for(let i=0; i<phases.length; i++){

          switch (phases[i][0].type){
            case OperationType.UNION:
              phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as SearchRequest, pResult);
              phaseRes[i] = phaseRes[i-1].concat(phaseRes[i]);
              break;
            case OperationType.INTERSECT:
              throw CacheException.DENY_SEARCH_WITH_INTERSECT();
              phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as SearchRequest, pResult);

              break;
            case OperationType.JOIN:
              throw CacheException.DENY_SEARCH_WITH_JOIN();
              phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as SearchRequest, pResult);
              break;
            case OperationType.AGGR:
              throw CacheException.DENY_SEARCH_WITH_AGGREGATE();
              break;
            case OperationType.SIZE:
              if(phaseRes[i].length <= phases[i][0].args.limit){
                result.newLimit = phases[i][0].args.limit - phaseRes[i].length;
              }else{
                result.newLimit = 0;
                phaseRes[i] = phaseRes[i].slice(0, phases[i][0].args.limit);
              }
              break;
            default:
              matchFn = this._createComparisonFunction(phases[i]);
              phaseRes[i] = phaseRes[i].map((vEntry:any)=>{
                return (matchFn.bind(vEntry));
              });
              break;
          }

        }
        result.results = phaseRes.pop();
        result.completed = true;
      }

      return result;
    }

    async search( pRequest:SearchRequest, pResult:IDbIndex):Promise<IDbIndex> {

      // search is line in cache satisfies the request
      let result:any[] = [];
      let continueSearch = true;

      if(!pRequest.hasAggregate()){
        const res = this._searchInCacheStore( pRequest, pResult);
        if(res.results.length>0){
          result = res.results;
        }

        continueSearch = (res.newLimit>0) || (res.newLimit==-1);
      }


      // update result index
      result.map( (x:any,o:number)=>{ pResult.setEntry(o,x) });

      // search in DB if : not enough in cache or not searchable (aggregate)
      if(continueSearch){
        const coll = this._extConn.getCollection(this.name, this._type);
        if(coll == null){
          return pResult;
        }

        // @ts-ignore
        let res2 = await (coll.search(pRequest, pResult));
        if(await res2.length>0){
          const base = pResult.size();
          (await res2).map( (x:any,o:number)=>{ pResult.setEntry(base+o,x) });
        }
      }


      return await pResult;
    }

    toJsonObject():any{
        let o:any= {};

        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};
        for(let i in this.values){
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }
}

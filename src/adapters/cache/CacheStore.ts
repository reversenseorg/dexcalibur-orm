import {FLUSH_POLICY, IndexCachePolicy} from "./CachePolicy";


export interface CacheEntry {
  // cached value
  value:any;
  // time of the last access
  lastRead:number;
  // counter of read access
  accessCtr:number;

  offset?:number

  inv:boolean
}

/**
 * The store where cached data are stored
 *
 * @class
 */
export class CacheStore {

  _cache: CacheEntry[] = [];

  _sizeLimit:number = 0;

  /**
   * The number of active entries
   *
   * It starts from 0, it is incremented when a new entry is push in the cache,
   * and decremented when a line is invalidated
   *
   * @field
   */
  _size = 0;

  _invalidated:number[] = [];
  _policy:IndexCachePolicy;

  /**
   *
   * @param pPolicy
   * @param pSizeLimit
   * @constructor
   */
  constructor(pPolicy:IndexCachePolicy, pSizeLimit:number = -1){
    this._policy = pPolicy;
    this._sizeLimit = (pSizeLimit>-1)? pSizeLimit : this._policy.cacheSize;
  }

  /**
   * TODO :  change, current can be a false positive
   * @method
   */
  isNotEmpty(){
    return (this._cache.length > 0)
  }

  /**
   * To get the number of valid entry in the cache
   *
   * @return {number} The number of valid entry
   * @method
   */
  countEntry():number {
    return this._size;
  }

  /**
   * To get an entry with a custom match function
   *
   * @param pCheckFn
   */
  getEntry(pCheckFn:((vVal:CacheEntry)=>boolean)):any {
    for(let i=0; i<this._cache.length; i++){
      if(pCheckFn.apply(null, [ this._cache[i] ]) && !this._cache[i].inv){
        this._cache[i].lastRead = (new Date()).getTime();
        this._cache[i].accessCtr++;
        return  this._cache[i];
      }
    }

    return null;
  }

  /**
   * To get X first entries from the cache
   *
   * @param pCheckFn
   */
  getAll(pLimit:number = -1):any[] {

    const all:any = [];

    for(let i=0; i<this._cache.length; i++){
      if(!this._cache[i].inv && (i<pLimit || pLimit==-1)){
        all.push(this._cache[i].value);
        this._cache[i].lastRead = (new Date()).getTime();
        this._cache[i].accessCtr++;
      }
    }

    return all;
  }

  /**
   * To add several entries into cache
   *
   * TODO : optimize by preventing to recreate existing cache line
   *
   * @param {any[]} pValues A list of value to  cache
   * @method
   */
  addEntries( pValues:any[]){
    console.log(`[CacheStore] Inserting ${pValues.length} new lines `);
    for(let i=0; i<pValues.length; i++){
      this.addEntry(pValues[i]);
    }
  }

  /**
   * Add a cache entry if needed
   * Must be thread safe
   *
   * we assume the user has called getEntry() to test if the object exists in tohe cache
   *
   * @param pValue
   */
  addEntry( pValue:any):CacheEntry {
    let entry:CacheEntry;

    entry = { value:pValue, lastRead:(new Date()).getTime(), accessCtr:0, inv:false }

    // we assume the user has called getEntry() to test if the object exists in tohe cache
    if(this._cache.length >= this._sizeLimit){
      // if max size of cache has been reach, we evict data by following policy

      if(this._invalidated.length>0){
        this._cache[this._invalidated.pop() as number] = entry ;
        this._size++;
        return entry;
      }

      let useless:any = { o:-1, time:(new Date()).getTime() };
      switch (this._policy.flushPolicy){

        case FLUSH_POLICY.OLDEST:
          useless = { o:-1, time:(new Date()).getTime() };
          this._cache.map((vEntry, vOffset)=>{
              if(vEntry.lastRead<useless.time) useless = { o:vOffset, time:vEntry.lastRead };
          });
          break;

        case FLUSH_POLICY.USELESS:
          useless = { o:-1, ctr:Infinity };
          this._cache.map((vEntry, vOffset)=>{
            if(vEntry.accessCtr<useless.ctr) useless = { o:vOffset, ctr:vEntry.accessCtr };
          });
          break;

        case FLUSH_POLICY.NO_ATOMIC_FLUSH:
          // we wait full flush (trigged when index are destroyed, ..)
          // No cache
          break;
      }

      if(useless!=null && useless.o > -1){
        // oldest line is replace by new one at same offset
        this._cache[useless.o] = entry
        return entry;
      }
    }else if(this._invalidated.length>0){
      this._cache[this._invalidated.pop() as number] = entry ;
      this._size++;
    }else{
      this._cache.push(entry);
      this._size++;
    }

    return entry;
  }


  /**
   * To get an entry with a custom match function
   *
   * @param pCheckFn
   */
  removeEntry(pCheckFn:((vVal:CacheEntry)=>boolean)):boolean {
    for(let i=0; i<this._cache.length; i++){
      if(pCheckFn.apply(null, [ this._cache[i] ])){
        this._cache[i].inv = true;
        this._invalidated.push(i);
        this._size--;
        return  true;
      }
    }

    // reached if the cache not contains the entry
    return true;
  }


  /**
   * To update an entry from the cache
   *
   * @param {Function} pCheckFn A comparison function to find the right entry
   * @param {any} pValue The object to store
   * @return {CacheEntry} The modified/added cache entry
   * @method
   */
  updateEntry(pCheckFn:((vVal:CacheEntry)=>boolean), pValue:any):CacheEntry {
    for(let i=0; i<this._cache.length; i++){
      if(pCheckFn.apply(null, [ this._cache[i] ]) && !this._cache[i].inv){
        this._cache[i].value = pValue;
        this._cache[i].accessCtr++;
        return this._cache[i];
      }
    }

    // this part is reached if there is not entry to update for the specified value,
    // the we add it to the cache as a new entry
    return this.addEntry(pValue);
  }

  flush():boolean {
    this._cache = [];
    this._size = 0;
    this._invalidated = [];
    return true;
  }

  getInfo():any {
    return {
      size: this._size,
      sizeLimit: this._sizeLimit,
      invalidated: this._invalidated.length,
      policy: this._policy
    }
  }
}

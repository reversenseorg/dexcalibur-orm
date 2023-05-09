
import {IDatabase, IDbIndex} from "../../../orm/DbAbstraction";
import { CacheStore} from "./CacheStore";
import {IndexCachePolicy} from "./CachePolicy";
import {NodeType} from "../../../orm/NodeType";



/**
 * Represents an array of element
 *
 * @author Georges-B. MICHEL
 * @class
 * @export
 */
export default class CacheDbIndex implements IDbIndex
{
    static __type:string = "Index";
    name:string;
    refs:any = [];
    _db:IDatabase;
    _cache:CacheStore|null;
    _backend:IDbIndex|null = null;

    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(name:string = "", pDB:IDatabase, pNodeType:NodeType, pPolicy:IndexCachePolicy|null = null){
        this.name = name;
        this.refs = [];
        this._db = pDB;

        if(pPolicy!=null){
          this._cache = new CacheStore(pPolicy);
        }
    }

    setPersistBackend( pColl:IDbIndex):void {
      this._backend = pColl;
    }

    /**
     * To add an entry
     *
     * @param {*} ref
     * @param {Boolean} force
     * @method
     */
    insert(ref:any, force:boolean=false){
        if(force || this.refs.indexOf(ref)===-1)
            this.refs.push(ref);
    }

    // just a wrapper
    /**
     * To add an entry (alias of insert() )
     *
     * @param {*} ref
     * @method
     */
    addEntry(ref:any){
        this.insert(ref);
    }

    /**
     *
     * @param offset
     * @param ref
     */
    setEntry(offset:number, ref:any):void {
        this.refs[offset] = ref;
    }

    /**
     *
     * @param offset
     * @param ref
     */
    updateEntry(offset:number, ref:any) {
        this.refs[offset] = ref;
    }


    /**
     * To execute a function for each entry
     *
     * @param {function} fn Callback
     * @method
     */
    map(fn:any){
        for(let i:number=0; i<this.refs.length; i++){
            fn(i, this.refs[i]);
        }
    }

    _isCached(pOffset:number){
      return (this.refs[pOffset] != null);
    }

    _readEntryFromCache():any{

    }

    _addEntryToCache( pOffset:number, pValue:any):any {

    }

    _updateCache(pOffset:number, pSrcIdx:IDbIndex){
      this.refs[pOffset] = pSrcIdx.getEntry(pOffset);

      return (this.refs[pOffset] != null);
    }

    /**
     * To get an entry by its offset
     *
     * @param {number} offset
     * @returns {*}
     * @method
     */
    getEntry(offset:number){

      /*
        let e:any;

        if(this._cache!=null && this._cache.isNotEmpty()){
          let entry = this._cache?.getEntry((vEntry:CacheEntry)=>{
            return (vEntry.value.getUID()===offset);
          });
          e = entry.value;
        }else{
          e = this._extConn.getCollection(this.name, this._type).getEntry(pKey, pOptions);
        }

        if(this._cache!=null && this._cache.isNotEmpty())
          e =  this.refs[offset];
        }else{
         e = this._extConn.getCollection(this.name, this._type).getEntry(pKey, pOptions);
        }*/

        return this.refs[offset];
    }


    hasCache():boolean {
      return this._cache!=null;
    }

    getCache():CacheStore {
      if(this._cache==null) throw new Error("The collection has not cache.");
      return this._cache
    }
    /**
     * To get all entries
     *
     * @returns {Object[]}
     * @method
     */
    getAll():any{
        return this.refs;
    }


    getAsList():any[] {
        return this.getAll();
    }


    isCollection():boolean{
        return false;
    }

    isIndex():boolean{
        return true;
    }

    /**
     * To get the number of elements into the index
     *
     * @returns {number}
     * @method
     */
    size():number{
        return this.refs.length;
    }


    hasEntry(value:any):boolean{
        return (this.refs.indexOf(value) > -1);
    }

    removeEntry(key: any): boolean {
        this.refs[key] = null;
        return true;
    }

    /**
     * To transform current index to simple object ready to be serialized.
     *
     * @returns {{}}
     * @method
     */
    toJsonObject():any{
        let o:any = {};

        o.name = this.name;
        o.refs = [];
        for(let i:number=0; i<this.refs.length; i++){
            if(typeof this.refs[i].toJsonObject  === 'function'){
                o.refs[i] = this.refs[i].toJsonObject()
            }else{
                o.refs[i] = this.refs[i];
            }
        }

        return o;
    }

    // ======= serialize =======


    isSerializable():boolean{
        let ret:boolean = false;
        for(let i:number=0; i<this.refs.length ; i++)
            ret = ret && this.refs[i].isSerializable();

        return ret;
    }

    static unserialize(serialized_obj:any){
        /*let self:CacheDbIndex = new CacheDbIndex(), o=null;
        self.name = serialized_obj.name;
        self.refs = [];
        for(let i:number=0; i<serialized_obj.refs.length; i++){
            if(SerializedObject.isUnserializable(serialized_obj.refs[i])){
                o = new SerializedObject(serialized_obj.refs[i]);
                self.refs.push(o.unserialize());
            }
            else
                self.refs.push(serialized_obj.refs[i]);
        }
        return self;*/
    }


    serialize(){
        let o:any = {};

        o.__type = CacheDbIndex.__type;
        o.name = this.name;
        o.refs = [];

        for(let i:number=0; i<this.refs.length; i++){
            if(this.refs[i].hasOwnProperty('isSerializable') && (this.refs[i].isSerializable() === true)){
                o.refs.push(this.refs[i].serialize());
            }else if(typeof this.refs[i].toJsonObject === 'function')
                o.refs.push(this.refs[i].toJsonObject());
            else
                o.refs.push(this.refs[i]);
        }

        return o;
    }
}


import {DbSetType, IDbIndex, IDatabase} from "../../../orm/DbAbstraction";
import { ElasticAPI} from "./ElasticAPI";
import {ElasticException} from "./ElasticException";
import {NodeType} from "../../../orm/NodeType";
import {ElasticDb} from "./ElasticDb";
import {CacheStore} from "../cache/CacheStore";

/**
 * Represents an array of element stored in a SQLite table
 *
 * @author Georges-B. MICHEL
 * @class
 * @export
 */
export default class ElasticDbIndex implements IDbIndex
{
    static __type:string = DbSetType.INDEX;

    // @ts-ignore
  private _idxName:string[] = [];
    name:string;
    refs:any = []; // replace by cache

    values:any = {};
    // @ts-ignore
  private _tpl: NodeType;
    // @ts-ignore
  private _s:ElasticAPI;
    public _db:IDatabase;


    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(pApi:ElasticAPI, name:string[], pTpl:NodeType){
      this._idxName = name;
      this._tpl = pTpl;
      this._s = pApi;
    }


  hasCache():boolean {
    return false;
  }

  getCache():CacheStore {
    throw new Error("The collection has not cache.");
  }

    setDB(pDB:ElasticDb):any {
        this._db = (pDB as IDatabase);
        return this;
    }

    create(){
        // check if elastic index exists
      /*if(this._s.isIndexExists()){

      }*/
        // this._s._createTable( this.name, [].concat(this._tpl.getProperties()), {notExists:true});
        return this;
    }

    /**
     * To add an entry
     *
     * @param {*} ref
     * @param {Boolean} force
     * @method
     */
    insert(ref:any, force:boolean=false){
        // not suppoert
    }

    // just a wrapper
    /**
     * To add an entry (alias of insert() )
     *
     * @param {*} ref
     * @method
     */
    addEntry(ref:any){
      // not supported
    }



    updateEntry(offset:number, ref:any) {
      // not supported
    }

    /**
     *
     * @param offset
     * @param ref
     */
    setEntry(offset:number, ref:any):void {

      // not supported

    }

    /**
     * To execute a function for each entry
     *
     * @param {function} fn Callback
     * @method
     */
    map(fn:any){
      // not supported
    }


    getAsList():any[] {
        return this.getAll();
    }

    /**
     * To get an entry by its offset
     *
     * @param {number} offset
     * @returns {*}
     * @method
     */
    getEntry(offset:number){

      // not supported
      return null;
    }

    /**
     * To get all entries
     *
     * @returns {Object[]}
     * @method
     */
    getAll():any{
        // not supported
        return null;
    }

    isCollection():boolean{
        return false;
    }

    isIndex():boolean{
        return true;
    }


    removeEntry(key: any): boolean {
      // not supported
        return false;
    }

    /**
     * To get the number of elements into the index
     *
     * @returns {number}
     * @method
     */
    size():number{

      // not supported
        return 0;
    }


    hasEntry(value:any):boolean {
      // not supported
        return false;
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
        return false;
    }

    static unserialize(serialized_obj:any){
        throw new ElasticException("SqliteDbIndex are not serializable");
    }


    serialize(){
        throw new ElasticException("SqliteDbIndex are not serializable");
    }
}

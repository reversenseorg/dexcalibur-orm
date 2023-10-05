/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject.js";
import {InMemoryException} from "./error/InMemoryException.js";
import { IDbCollection } from "../../../src/DbAbstraction.js";
import { NodeType } from "../../../src/NodeType.js";
import {INode} from "../../../src/INode.js";


export default class InMemoryDbCollection implements IDbCollection
{
    static __type:string = "Collection";

    name:string;
    ctr:number = 0;
    values:any = {};
    _db:any;
    // @ts-ignore
  private _tpl: NodeType|undefined;

    constructor(name:string = "", pNodeType?:NodeType){
        this.name = name;
        this.ctr = 0;
        this._tpl = pNodeType;
    }


      hasProxy():boolean {
        return false;
      }

      getProxy():any {
        throw  InMemoryException.NO_PROXY_AVAILABLE("getProxy", this.name);
      }

    asyncAddEntry?(): Promise<void> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("asyncAddEntry", this.name);
    }
    asyncUpdateEntry?(): Promise<any> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("asyncUpdateEntry", this.name);
    }
    asyncGetEntry(): Promise<any> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("asyncGetEntry", this.name);
    }
    asyncRemoveEntry?(): Promise<boolean> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("asyncRemoveEntry", this.name);
    }
    search?(): Promise<any> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("search", this.name);
    }

    setEntry(key:string,value:any){

        if(key===null){
            throw InMemoryException.KEY_CANNOT_BE_NULL("setEntry", this.name);
        }
        if(key===undefined){
            throw InMemoryException.KEY_CANNOT_BE_UNDEFINED("setEntry", this.name);
        }

        if(!this.hasEntry(key)){
            this.ctr++;
        }
        this.values[key] = value;
    }

    addEntry(key:string,value:any){
        if(key===null){
            throw InMemoryException.KEY_CANNOT_BE_NULL("addEntry", this.name);
        }
        if(key===undefined){
            throw InMemoryException.KEY_CANNOT_BE_UNDEFINED("addEntry", this.name);
        }
        this.setEntry(key,value);
    }

    updateEntry(value:INode):any{
        this.setEntry(value.getUID() as string, value);
        //throw new Error('Update : Operation not supported.');
    }



    getEntry(key:string):any{
        if(key === null || key === undefined){
            return null;
        }

        return this.values[key];
    }


    /**
     * To get an array containing only values from the collection
     *
     * Important : If an object is deleted from the collection, the list  i not updated
     *
     * @method
     */
    getAsList():any[] {
        return Object.values(this.values);
    }

    /**
     * To get all pairs key/value from the collection
     *
     * Important : If an object is deleted from the collection, after read of getAll(), the value returned
     * by getAll() is updated. Be aware, that can make race condition. You could prefer to use `getAsList()`
     * instead of `getAll()` as it create a new array.
     *
     * @method
     */
    getAll():any{
        return this.values;
    }

    hasEntry(key:string):boolean{
        return (this.values[key] !== undefined);
    }

    map(fn:((key:string, value:any)=>any)){
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
        return this.ctr;
    }


    removeEntry(key: any): boolean {


        const v = (delete this.values[key]);
        if( Object.keys(this.values).length < this.ctr){
            this.ctr = this.ctr-1;
        }
        return v;
    }

    removeAll():boolean{
        this.values = {};
        this.ctr = 0;
        return true;
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

    // ======= serialize =======

    isSerializable():boolean{
        return true;
    }

    static unserialize(serialized_obj:any):IDbCollection{
        let self:InMemoryDbCollection = new InMemoryDbCollection(), o=null;
        self.name = serialized_obj.name;
        self.ctr = serialized_obj.ctr;
        self.values = {};
        for(let i in serialized_obj.values){

            if(SerializedObject.isUnserializable(serialized_obj.values[i])){
                o = new SerializedObject(serialized_obj.values[i])
                self.values[i]=o.unserialize();
            }
            else
                self.values[i]=serialized_obj.values[i];
        }
        return (self as IDbCollection);
    }

    serialize():any{
        let o:any= {};

        o.__type = InMemoryDbCollection.__type;
        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};

        for(let i in this.values){

            if(typeof this.values[i].serialize === 'function')
                o.values[i]=this.values[i].serialize();
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }

    asyncHasEntry(): Promise<boolean> {
        throw  InMemoryException.ASYNC_NOT_SUPPORTED("asyncHasEntry", this.name);
    }
}

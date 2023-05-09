/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject";
import {IDbCollection} from "../../../orm/DbAbstraction";
import {NodeType} from "../../../orm/NodeType";
import {CacheStore} from "../cache/CacheStore";


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


  hasCache():boolean {
    return false;
  }

  getCache():CacheStore {
    throw new Error("The collection has not cache.");
  }

    asyncAddEntry?(key: any, pOptions?: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    asyncUpdateEntry?(value: any, pOptions?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    asyncGetEntry(key: string, pOptions?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    asyncRemoveEntry?(key: any, pOptions?: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    search?(pRequest: any, pOptions?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this.ctr++;
        }
        this.values[key] = value;
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    updateEntry(value:any):any{
        this.setEntry(value.getUID() as string, value);
        //throw new Error('Update : Operation not supported.');
    }



    getEntry(key:string):any{
        return this.values[key];
    }


    getAsList():any[] {
        return Object.values(this.values);
    }

    getAll():any{
        return this.values;
    }

    hasEntry(key:string):boolean{
        return (this.values[key] !== undefined);
    }

    map(fn:any){
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
        return (delete this.values[key]);
    }

    removeAll():boolean{
        this.values = {};
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
}

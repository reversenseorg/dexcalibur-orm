/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import InMemoryDbCollection from "./InMemoryDbCollection.js";
import InMemoryDbIndex from "./InMemoryDbIndex.js";
import InMemoryConnector from "./InMemoryConnector.js";
import { NodeType } from "../../../src/NodeType.js";
import { IDatabase } from "../../../src/DbAbstraction.js";

/**
 * Represent a "in memory" database
 *
 * It supports two way to store data : index (stack) and collection (key/value map)
 *
 * @implements {IDatabase}
 * @class
 */
class InMemoryDb implements IDatabase
{
    conn:InMemoryConnector;

    indexes:any = {};
    sizes:any = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pConnector:InMemoryConnector){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};
    }

    getAll():any{
        return this.indexes;
    }


    supportsEvent():boolean {
      return false;
    }

    /**
     * To check if a node set (index or collection) exists or not
     *
     * @param {string} pName Node set name
     * @return {boolean} TRUE is exists, else FALSE
     * @method
     */
    exists(pName:string):boolean {
        return (this.indexes[pName] != null);
    }

    /**
     * To create a new collection into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(name:string, pNodeType?:NodeType):InMemoryDbCollection{
        if(this.indexes[name]!=null) throw new Error("A collection is already set for the given name");

        this.indexes[name] = new InMemoryDbCollection(name,pNodeType);

        return this.indexes[name];
    }

    /**
     * To create a new index into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(name:string, pNodeType?:NodeType):InMemoryDbIndex{
        if(this.indexes[name] != undefined) throw new Error("An index already exists for the given name");

        this.indexes[name] = new InMemoryDbIndex(name,pNodeType);

        return this.indexes[name];
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name:string, pNodeType:NodeType|null = null):InMemoryDbIndex{
        if(this.indexes.hasOwnProperty(name)===false && pNodeType!=null){
            this.newIndex(name, pNodeType);
        }
        return this.indexes[name];
    }

    /**
     * To get an index by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {InMemoryDbIndex} Index with the given name
     * @method
     * @since 1.0.0
     */
    getIndexOf(pTemplate:NodeType):InMemoryDbIndex{
        return this.getIndex(pTemplate.getName(), pTemplate);
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getCollection(name:string, pNodeType:NodeType|null = null):InMemoryDbCollection{
        if(this.indexes.hasOwnProperty(name)===false && pNodeType!=null){
            this.newCollection(name, pNodeType);
        }
        return this.indexes[name];
    }

    /**
     * To get a collection by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {InMemoryDbCollection} Index with the given name
     * @method
     * @since 1.0.0
     */
    getCollectionOf(pTemplate:NodeType):InMemoryDbCollection{
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
            if(this.indexes[i] instanceof InMemoryDbIndex)
                this.indexes[i].__type = "Index";
            else
                this.indexes[i].__type = "Collection";
        }

        return o;
    }

    getProject(): any {
        return this.conn.ctx;
    }

    // ============ serialize ============

    isSerializable():boolean{
        let ret:boolean=true;
        for(let i in this.indexes){
            ret = ret && this.indexes[i].isSerializable();
        }
        return ret;
    }

    unserialize(obj:any):void{
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = InMemoryDbIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = InMemoryDbCollection.unserialize(obj.indexes[i]);
            }
        }
    }

    serialize():any{
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

        return o;
    }
}

export {InMemoryDb};
export {InMemoryDbIndex as Index};
export {InMemoryDbCollection as Collection};

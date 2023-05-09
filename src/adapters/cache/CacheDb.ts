/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import CacheDbCollection from "./CacheDbCollection";
import CacheDbIndex from "./CacheDbIndex";
import {IDatabase} from "../../../orm/DbAbstraction";
import {NodeType} from "../../../orm/NodeType";
import CacheConnector from "./CacheConnector";
import {IndexCachePolicy} from "./CachePolicy";
import {CacheException} from "./CacheException";
import { Finder } from "../../../../search/Finder";

/**
 * Represent a composite cache database including several others DB : elastic, memory and redis
 *
 *
 * @implements {IDatabase}
 * @class
 */
export class CacheDb implements IDatabase
{
    conn:CacheConnector;

    indexes:any = {};
    sizes:any = {};

    cluster: IDatabase[] = [];

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pConnector:CacheConnector){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};
    }


  supportsEvent():boolean {
    return false;
  }

    getAll():any{
        return this.indexes;
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
     * To retrieve the cache policy for the Node Type specified in arguments
     *
     * @param {NodeInternalType} pNodeType
     * @method
     */
    getCachePolicyFor(pNodeType:NodeType):IndexCachePolicy|null {
      const policies:IndexCachePolicy[] = (this.conn.options.policy as any).indexPolicy;

      for(let i=0; i<policies.length; i++) {
        if(policies[i].objectTypes.indexOf(pNodeType.getType())>-1){
          return policies[i];
        }
      }

      return null;
    }

    /**
     * To create a new collection into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(name:string, pNodeType:NodeType|null = null):CacheDbCollection{

          console.log("[*] Creating collection into to cache DB");

        if(this.indexes[name]!=null) throw new Error("A collection is already set for the given name");
        if(pNodeType == null) throw CacheException.CANNOT_CREATE_COLLECTION_WITHOUT_TYPE();

        const policy = this.getCachePolicyFor(pNodeType);
        this.indexes[name] = new CacheDbCollection(name, this, pNodeType, policy);

        // create collection into cluster node associated to the nodetype
        const conns = this.conn.getSubConnector(pNodeType.getDataSource().name);
        this.indexes[name].setPersistBackend(conns?.getDB().newCollection(name, pNodeType));


        return this.indexes[name];
    }

    /**
     * To create a new index into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(name:string, pNodeType:NodeType|null = null):CacheDbIndex{
      console.log("[*] Creating index into to cache DB");
        if(this.indexes[name] != undefined) throw new Error("An index already exists for the given name");
        if(pNodeType == null) throw CacheException.CANNOT_CREATE_INDEX_WITHOUT_TYPE();

        const policy = this.getCachePolicyFor(pNodeType);
        this.indexes[name] = new CacheDbIndex(name,this,pNodeType,policy);

        // create collection into cluster node associated to the nodetype
        if(pNodeType!==Finder.NODE_ANY){
          const conns = this.conn.getSubConnector(pNodeType.getDataSource().name);
          this.indexes[name].setPersistBackend(conns?.getDB().newIndex(name, pNodeType));
        }



      return this.indexes[name];
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name:string, pNodeType:NodeType|null = null):CacheDbIndex{
        if(this.indexes.hasOwnProperty(name)===false && pNodeType!=null){
            this.newIndex(name, pNodeType);
        }
        return this.indexes[name];
    }

    /**
     * To get an index by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {CacheDbIndex} Index with the given name
     * @method
     * @since 1.0.0
     */
    getIndexOf(pTemplate:NodeType):CacheDbIndex{
        return this.getIndex(pTemplate.getName(), pTemplate);
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getCollection(name:string, pNodeType:NodeType|null = null):CacheDbCollection{
        if(this.indexes.hasOwnProperty(name)===false && pNodeType!=null){
            this.newCollection(name, pNodeType);
        }
        return this.indexes[name];
    }

    /**
     * To get a collection by node type
     *
     * @param {NodeType} pTemplate Node type
     * @returns {CacheDbCollection} Index with the given name
     * @method
     * @since 1.0.0
     */
    getCollectionOf(pTemplate:NodeType):CacheDbCollection{
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
            if(this.indexes[i] instanceof CacheDbIndex)
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
        /*let ret:boolean=true;
        for(let i in this.indexes){
            ret = ret && this.indexes[i].isSerializable();
        }*/
        return false;
    }

    unserialize(obj:any):void{
        /*for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = CacheDbIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = CacheDbCollection.unserialize(obj.indexes[i]);
            }
        }*/
    }

    serialize():any{
        let o:any=new Object();
/*
        o.indexes = {};
        for(let i in this.indexes){
            if(typeof this.indexes[i].isSerializable === 'function')
                o.indexes[i] = this.indexes[i].serialize();
            else if(typeof this.indexes[i].toJsonObject === 'function')
                o.indexes[i] = this.indexes[i].toJsonObject();
            else
                o.indexes[i] = this.indexes[i];
        }*/

        return o;
    }
}

//export {CacheDb};
export {CacheDbIndex as Index};
export {CacheDbCollection as Collection};

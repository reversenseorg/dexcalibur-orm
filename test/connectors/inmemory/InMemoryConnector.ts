'use strict';

import { InMemoryDb } from "./InMemoryDb.js";
import {InMemoryException} from "./error/InMemoryException.js";
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "../../../src/DbAbstraction.js";
import {IAppContext} from "../../../src/IAppContext.js";
import { NodeType } from "../../../src/NodeType.js";

const TYPE  = 'inmemory';
const NAME = 'InMemory';
const DESC = 'Data are stored in memory. Only saved data can be restored (such as intercepted bytecode, DEX file loaded dynamically and more)';

interface DatabaseInstanceList {
    [name :string] :IDatabase|null
}

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class InMemoryConnector implements IDatabaseAdapter
{

    static UUID = TYPE;

    ctx:any = null;

    options:any = null;

    type:string = TYPE;

    db:InMemoryDb|null = null;

    tmpDbs:DatabaseInstanceList = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pContext:IAppContext, pOptions:any = null){
        this.ctx = pContext;
        this.options = pOptions;
    }


    getSubConnector(pName:string):IDatabaseAdapter|null{
      // not supported
      return null;
    }

    /**
     * empty
     * @returns {boolean}
     */
    exists():boolean{
        // nothing to do
        return true;
    }

    /**
     * empty
     * @returns {boolean}
     */
    create():boolean{
        // nothing to do
        return true;
    }

    /**
     * empty
     *
     * @method
     */
    connect( pOptions:any  = null):boolean{
        // nothing to do
        this.db = new InMemoryDb(this);
        return true;
    }


    /**
     * empty
     *
     * @method
     */
    close():boolean{
        // nothing to do
        return true;
    }

    /**
     * To get an index by its name
     * @param pName
     */
    getIndex( pName:string, pNode?:NodeType):IDbIndex{
        if(this.db == null){
          throw InMemoryException.NULL_DB_INSTANCE();
        }

        return this.db.getIndex(pName,pNode) as IDbIndex;
    }

  /**
   * To get a collection by its name
   *
   * @param {string} pName
   */
    getCollection( pName:string, pNode?:NodeType):IDbCollection{
      if(this.db == null){
        throw InMemoryException.NULL_DB_INSTANCE();
      }

      return this.db.getCollection(pName,pNode) as IDbCollection;
    }

  /**
   * To create a new tempory database
   *
   * This is mainly used as buffering
   *
   * @param pName
   */
  newTemporaryDb(pName: string): IDatabase {
        this.tmpDbs[pName] = new InMemoryDb(this);

        return (this.tmpDbs[pName] as IDatabase);
    }

    clearTemporaryDb( pName:string):void{
        this.tmpDbs[pName] = null;
    }

    /**
     * To get DB instance
     * @method
     */
    getDB():IDatabase{
        if(this.db == null){
          throw InMemoryException.NULL_DB_INSTANCE();
        }
        return this.db;
    }

    /**
     * To get adapter/db type
     *
     * @return {string}
     * @method
     */
    getType(): string {
        return this.type;
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     * @static
     */
    static getProperties():any {
        let o:any = {};

        o.type = TYPE;
        o.name = NAME;
        o.description = DESC;

        return o;
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     */
    toJsonObject():any{
        return InMemoryConnector.getProperties();
    }
}

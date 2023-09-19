import {NodeType} from "./NodeType.js";

export enum DbDataType {
    // strings
    STRING,
    CHARACTER,
    VARCHAR,
    TEXT,
    NVARCHAR,
    NCHAR,
    CHAR,

    // binary
    BLOB,

    // integers
    INTEGER,
    INT,
    TINYINT,
    SMALLINT,
    MEDIUMINT,
    BIGINT,
    UNSIGNED_BIG_INT,
    INT2,
    INT8,

    // null
    NULL,

    // float
    REAL,
    DOUBLE,
    DOUBLE_PRECISION,
    FLOAT,

    // misc
    NUMERIC,
    DECIMAL_10_5,
    BOOLEAN,
    DATE,
    DATETIME
}

export enum DbKeyType {
    PRIMARY,
    FOREIGN,
    COMPOSITE
}

export enum DbSerialize {
    JSON,
    RAW
}

export enum DbSetType {
    INDEX="Index",
    COLL="Collection"
}

export interface IDbSet {
    map(fn:any):void;

    getAsList(pLimit?:number, pOptions?:any):any[]|any;

    getAll(pOptions?:any):any;

    isCollection():boolean;

    isIndex():boolean;

    size():number;

    toJsonObject():any;

    search?( pRequest:any, pOptions?:any):Promise<any>;

    /**
     * To check if a proxy is configured to intercept some operation
     *
     * Such proxy can be used as a cache mechanisms
     *
     * Replace hasCache()
     */
    hasProxy():boolean;

    /**
     * Replace getCache()
     */
    getProxy():any;
}

/*
export interface IDbSetAsync extends IDbSet {
  map(fn:any):Promise<void>;

  getAsList(pLimit?:number, pOptions?:any):Promise<any[]>;

  getAll(pOptions?:any):Promise<any>;

  size():Promise<number>;
}*/


/**
 * Represent a list of object indexed by numeric key
 *
 * Such interface is better to represent data stored into
 * a table from a RDBMS Table with a senseless numeric primary key
 *
 * @implements {IDbSet}
 * @interface
 */
export interface IDbIndex extends IDbSet {

    name:string;

    _db:IDatabase;

    insert(ref:any, force:boolean, pOptions?:any):void;

    addEntry(ref:any, pOptions?:any):void;

    setEntry(offset:number, ref:any, pOptions?:any):void;

    getEntry(offset:number, pOptions?:any):any;

    hasEntry(value:any, pOptions?:any):boolean;

    removeEntry(key: any, pOptions?:any):boolean;

    updateEntry(key:any, ref:any, pOptions?:any):any;
}

export interface DbSetMap {
    [name:string] :IDbSet ;
}

export interface DbSizesMap {
    [name:string] :number ;
}

/**
 * Represent a set of object indexed by name/UUID
 *
 * Such interface is best suited to represent data stored into
 * a collection or index, and referenced by an unique name / string.
 *
 * @implements {IDbSet}
 * @interface
 */
export interface IDbCollection extends IDbSet
{
    name:string;

    _db:IDatabase;

    setEntry(key:string,value:any, pOptions?:any):any;

    addEntry(key:string,value:any, pOptions?:any):any;

    asyncAddEntry?(key: any, pOptions?:any):Promise<any>;

    updateEntry(value:any, pOptions?:any):any;

    asyncUpdateEntry?(value: any, pOptions?:any):Promise<any>;

    getEntry(key:string, pOptions?:any):any;

    asyncGetEntry(key:string, pOptions?:any):Promise<any>;

    hasEntry(key:string, pOptions?:any):boolean;

    asyncHasEntry(key:string, pOptions?:any):Promise<boolean>;

    removeEntry(key: any, pOptions?:any):boolean;

    asyncRemoveEntry?(key: any, pOptions?:any):Promise<boolean>;


}

/**
 * Interface for a connector to a database.
 *
 * Classes implementing this interface are responsible to connection/authentication to DBMS
 *
 * @interface
 */
export interface IDatabaseAdapter
{
    exists(pDbName?:string):boolean;
    create():boolean;
    connect(pOptions:any):any;
    close():boolean;
    getIndex( pName:string, pNodeType?:NodeType):IDbIndex;
    getCollection( pName:string, pNodeType?:NodeType):IDbCollection;
    getDB():IDatabase;
    getType():string;
    newTemporaryDb( pName:string):IDatabase;
    getSubConnector(pName:string):IDatabaseAdapter|null;
    toJsonObject():any;
}


export interface IDatabase
{
    onEvent$?:any;

    conn?:IDatabaseAdapter;

    supportsEvent():boolean;

    newCollection(name:string, pNodeType:NodeType):IDbCollection;

    newIndex(name:string, pNodeType:NodeType):IDbIndex;

    getIndex(name:string, pNodeType:NodeType):IDbIndex;

    getIndexOf(pNodeType:NodeType):IDbIndex;

    getCollection(name:string, pNodeType:NodeType|null):IDbCollection;

    getCollectionOf(pNodeType:NodeType):IDbCollection;

    getAll():any;

    exists(pName:string):boolean ;

    toJsonObject():any;

    isSerializable():boolean;

    serialize():any;

    unserialize(input:any):void;

    getProject():any;
}

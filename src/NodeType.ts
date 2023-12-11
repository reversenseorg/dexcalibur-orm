/**
 * Project : @reversense/dexcalibur-orm-connector
 * @copyright : Reversense SAS
 * @author Georges-B. Michel <georges@reversense.com>
 */
import {NodeProperty} from "./NodeProperty.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {DbKeyType} from "./DbAbstraction.js";
import {newLogger, Logger} from "./utils/Logger.js";
import {IncomingValue, UnsafeValue} from "./security/SanitizedValue.js";
import {ConnectorException} from "./error/ConnectorException.js";
import {DataSource} from "./DataSource.js";
import {OrmException} from "./error/OrmException.js";
import {DataSourceHelper} from "./DataSourceHelper";
import {IStringIndex} from "./core/IStringIndex";


export interface NodePropertyMap {
  [pptName:string] :NodeProperty;
}

export interface NodeTypeMap {
  [typeName:string] :NodeType;
}

export interface NodeInternalTypeMap {
  [internalType:string] :NodeType;
}

export interface NodeListenersMap {
  [event:string] :((arg:any)=>void)[]|((arg:any)=>void);
}


let Logger:Logger = newLogger() as Logger;

/**
 * Represents the type of the node
 *
 * @class
 */
export class NodeType {

  static ALL:NodeTypeMap = {}
  static INTERN:NodeInternalTypeMap = {}
  static MOCK:any = {};

  /**
   * The internal (short) name of the node type
   * @type {string}
   * @field
   */
  _type:NodeInternalType;

  /**
   * The name of the node type
   * @type {string}
   * @field
   */
  _name:string;

  /**
   * The constructor associated to this node type
   * @type {function}
   * @field
   */
  _builder:any = null;

  /**
   *
   */
  _ppts:NodePropertyMap = {};

  /**
   * Primary Key
   * cannot be a composite key
   */
  _pk:NodeProperty|null = null;
  _cpk:NodeProperty[] = [];

  /**
   * List of properties pointing to node(s)
   *
   */
  _l:NodeProperty[] = [];

  /**
   * List of node properties with multiple chrildren
   */
  _m:NodeProperty[] = [];

  /**
   * Data source callback for this node
   */
  _src:any = null;

  /**
   * Data source
   */
  _ds:string|null = null; //DataSourceHelper.FILE;

  /**
   * Data Source alias
   */
  _dsa:string;


  /**
   * Listener hash map
   */
  _ev:NodeListenersMap = {}

  _wrap:string|null = null;

  /**
   * To declare functions to transform wrapped data
   * @field
   */
  __transforms:any = null;
  /**
   *
   * @param {string} pName Node type name
   * @param {NodeProperty[]} pCols
   * @constructor
   */
  constructor( pName:string, pInternalType:NodeInternalType, pCols:NodeProperty[]) {
    this._name = pName;
    this._dsa = pName;
    this._type = pInternalType;

    if(NodeType.ALL[pName]==null){
      NodeType.ALL[pName] = this;
    }
    if(NodeType.INTERN[pInternalType]==null){
      NodeType.INTERN[pInternalType] = this;
    }

    this.updateProperties(pCols, {init:true});
  }

  isWrapping():boolean {
    return (this._wrap !== null);
  }


  isTransforming():boolean {
    return (this.__transforms !== null);
  }


  getWrapHost():string {
    if(this._wrap == null){
      throw new Error("Node template : wrapper is null");
    }
    return this._wrap as string;
  }

  wrapDataIn(pHost:string, pTransforms:any = null):NodeType {
    this._wrap = pHost;
    this.__transforms = pTransforms;
    return this;
  }

  is(pObject:any):boolean{
    return (pObject.hasOwnProperty('__')!=null) && (pObject.__ === this._type);
  }
  /**
   * To get the NodeType by its name
   *
   * @param {string} pName The NodeType name
   * @return {NodeType} The NodeType object with the specified name
   * @static
   * @method
   */
  static lookup(pName:string) :NodeType {
    return NodeType.ALL[pName];
  }

  /**
   * To get the NodeType by its InternalNodeType ID
   *
   * This method is useful to unserialize object
   *
   * @param {number} pInternalID The NodeType numeric ID
   * @return {NodeType} The NodeType object with the specified ID
   * @static
   * @method
   */
  static getByID(pInternalID:number) :NodeType {
    return NodeType.INTERN[pInternalID];
  }

  /**
   * To retrieve the Node type from its name
   *
   * @param {string} pName Node name, as declared in the constructor
   * @return {NodeType} Instance of the NodeType associated to this name
   * @method
   * @static
   */
  static getTypeByName(pName:string):NodeType {
    const type:NodeType = NodeType.ALL[pName];
    if(type==null){
      throw Error("NodeType not recognized");
    }
    return type;
  }

  onChange( pFn:((vPpts?:NodeProperty[])=>void) ){
    if(!this._ev.hasOwnProperty('change')) this._ev.change = [];
    (this._ev.change as any[]).push(pFn);
  }

  builder(pConstructor:any):NodeType {
    this._builder = pConstructor;
    return this;
  }


  getBuilder():any{
    return this._builder;
  }

  hasProperty(pName:string) :boolean {
    return (this._ppts[pName]!=null)
  }

  getProperty(pName:string) :NodeProperty {
    return this._ppts[pName];
  }

  /**
   * To add dynamically a property
   */
  addProperty( pName:string, pNode:NodeProperty):void{
    this._ppts[pName] = pNode;
  }

  /**
   * To clone the current primary key in order to inject
   * it into another node type as foreign key
   *
   * @param {DbKeyType} pKeyType
   * @param {number} pOffset Offset if foreign key is used as composite key into target node. Default : 0
   * @param {string} pName Value to override default foreign key name. Default is [NodeType.name][NodeProperty.name]
   * @return {NodeProperty} The freshly cloned property
   */
  asForeignKey( pKeyType:DbKeyType, pOffset =0, pName:string|null = null):NodeProperty{
    const pk=this.getPrimaryKey();
    const fk={
      _name:pName!=null ? pName : this.getName()+pk.getName()
    };

    if(!pk.isCompositeKey()){
      return this.getPrimaryKey().clone(fk).key(pKeyType, pOffset)
    }else {
      throw new ConnectorException("Injection of composite foreign keys are not supported : node=" + this.getName());
    }
  }


  /**
   * To update the properties of the node template
   *
   * @param {NodeProperty[]} pCols A list of properties to insert into this template
   * @method
   */
  updateProperties(pCols:NodeProperty[], pOpts:any = {init:false}):NodeType {
    pCols.map( (vPpt:NodeProperty) => {
      this._ppts[vPpt.getName()] = vPpt;
      if(vPpt.isPrimaryKey()){

        let p:NodeProperty;
        if(vPpt.isNode()){
          if(vPpt.getNodeType()==null){
            throw new Error("[ORM+CORE] Property node is not valid for : "+vPpt.getName());
          }
          p = (vPpt.getNodeType() as NodeType).getPrimaryKey();
        }else{
          p = vPpt;
        }

        if(p.getKeyOffset()>0){
          this._cpk[p.getKeyOffset()] = p;
        }else{
          this._pk = p;
        }
      }else if(vPpt.isCompositeKey()){

        let p:NodeProperty;
        if(vPpt.isNode()){
          p = (vPpt.getNodeType() as NodeType).getPrimaryKey();
        }else{
          p = vPpt;
        }
        this._cpk[p.getKeyOffset()] = p;
      }

      if(!vPpt.isVolatile()){
        if(vPpt.isNode()){
          this._l.push(vPpt);
        }

        if(vPpt.isMultiple()){
          this._m.push(vPpt);
          let fk = vPpt.getTargetFKName();
          if(fk == null)
            fk = this.getName()+this.getPrimaryKey().getName();


          if(!(vPpt.getNodeType() as NodeType).hasProperty(fk)){
            // n:n => create join table
            // temporary, store serialized obj
            Logger.raw(JSON.stringify(this.getPrimaryKey().clone({ _name:fk }).key(DbKeyType.COMPOSITE, 0)));

            if(this._pk != null){
              // if a primary key is already defined, primary key from foreign table is defined as FOREIGN
              (vPpt.getNodeType() as NodeType).updateProperties([
                this.getPrimaryKey().clone({ _name:fk }).key(DbKeyType.FOREIGN, 0)
              ]);
            }else{
              // if a primary key is not defined, primary key from foreign table is defined as COMPOSITE
              (vPpt.getNodeType() as NodeType).updateProperties([
                this.getPrimaryKey().clone({ _name:fk }).key(DbKeyType.COMPOSITE, 0)
              ]);
            }

          }
          // n:1, target node must have
          /*
          if(!vPpt.getNodeType().hasProperty(this.getName())){
              vPpt.getNodeType().updateProperties([
                  //this.getPrimaryKey().clone({ _name:this.getName() }).key(DbKeyType.COMPOSITE, 0)
                  this.getPrimaryKey().clone({ _name:this.getName() }).key(DbKeyType.COMPOSITE, 0)
              ]);
          }*/
        }
      }

    });

    //Logger.raw(this.getName()+' => '+Object.keys(this._ppts).join(','));

    if(!pOpts.init){
      this.trigger('change', pCols);
    }

    return this;
  }


  /**
   * To sanitize a value according to its property,
   *
   * If the property is not sanitizable, value is encapsulated into
   * UnsafeValue instance providing RASP protection.
   *
   * Property can be commonly not sanitizable because :
   * - Data sanitization format is not define
   * - Sanitization is not configured
   *
   *
   * @param {string} pName
   * @param {any} pValue
   * @return {IncomingValue}
   * @method
   */
  sanitize(pName: string, pValue: any): IncomingValue {
    const ppt:NodeProperty = this._ppts[pName];

    if(ppt.isSanitizable()){
      return ppt.sanitize(pValue);
    }else{
      return new UnsafeValue(pName, pValue);
    }
  }

  /**
   * To get the node type name
   *
   * @return {string} The node type name
   * @method
   */
  getName():string {
    return this._name;
  }

  /**
   * To get table columns template
   *
   * @return {NodeProperty[]} Columns template
   * @method
   */
  getProperties():NodeProperty[] {
    return Object.values(this._ppts);
  }

  getPrimaryKey():NodeProperty {
    if(this._pk==null){
      throw OrmException.UNDEFINED_PRIMARY_KEY(this._type)
    }
    return this._pk;
  }

  getCompositeKey():NodeProperty[] {
    return this._cpk;
  }

  getType():NodeInternalType{
    return this._type;
  }

  getExternalProperties():NodeProperty[] {
    return this._m;
  }

  /**
   *
   */
  hasExternalProperties():boolean {
    return (this._m.length > 0);
  }

  /**
   *
   */
  getSourceAlias():string {
    return this._dsa;
  }

  /**
   * To check if the node type require composite primary key
   * to be uniquely identified
   *
   * @return {boolean} TRUE if primary key is composite, else FALSE
   * @method
   * @since 1.0.0
   */
  hasCompositeKey():boolean {
    return (this._cpk.length>0);
  }

  hasLinks():boolean{
    return (this._l.length>0);
  }

  getLinks():NodeProperty[]{
    return this._l;
  }

  source(pSrc:any):any {
    this._src = pSrc;
    return this;
  }

  dataSource(pSrc:string, pExtra:any = null):any {
    this._ds = pSrc;
//        this._ds.register(this, pExtra);
    if(pExtra != null){
      this._dsa = pExtra;
    }

    return this;

  }


  getDataSource():DataSource {
    if(this._ds==null){
      throw new Error("[ORM+CORE] A data source is used but not defined");
    }
    if(((DataSourceHelper as any)[this._ds])==null){
      throw new Error("[ORM+CORE] Data source ["+this._ds+"] is missing.");
    }

    return (DataSourceHelper as any)[this._ds] as DataSource;
  }


  hasSource():boolean{
    return this._src != null;
  }

  getSource():any{
    return this._src;
  }

  subscribe( pOpeName:string, pCallback:any):NodeType {
    this._ev[pOpeName] = pCallback;
    return this;
  }

  trigger( pOpeName:string, pValue:any):any {
    if(!this._ev.hasOwnProperty(pOpeName)) return ;

    if(Array.isArray(this._ev[pOpeName])){
      (this._ev[pOpeName] as any[]).map( f => { f.apply(null,pValue) });
      return null;
    }else{
      return (this._ev[pOpeName] as any).apply(null,pValue);
    }
  }


}

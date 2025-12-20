import {DbDataType, DbKeyType, DbSerialize} from "./DbAbstraction.js";
import {NodeTransform, NodeType} from "./NodeType.js";
import {ValidationRule} from "./security/Validator.js";
import {IncomingValue, SanitizedValue, UnsafeValue} from "./security/SanitizedValue.js";
import {IStringIndex, Nullable} from "./core/IStringIndex.js";
import {OrmException} from "./error/OrmException.js";
import {IJSONSchema, IJSONSchemaCore, IJSONSchemaDocument} from "./utils/JSONSchema";


export interface NodePropertyState {
  p: any,
  ctx?: any,
  self?:any
}

export class NodeProperty {

  _name:string;
  _type:DbDataType|null = null;
  _size:number = -1;
  _key:DbKeyType|null = null;
  _k_p:number = 0;
  _idx:boolean = false;
  _nnull: boolean = false;
  _def:any = undefined;
  _serialize:DbSerialize|null = null;
  _n:NodeType|null = null;
  _v:boolean = false;
  _u:boolean = false;
  _m:boolean = false;
  _e:boolean = false;

    /**
     * JSONSchemaDocument
     */
  _scd:IJSONSchemaDocument|null = null;

    /**
     * JSONSchema
     */
    _sc:IJSONSchema|null = null;

    /**
     * The name of the local property where INodeRef is stored.
     * @type {string|null}
     * @field
     */
  _r:string|null = null;

  /**
   * Foreign Key name into target node
   * @type {string}
   * @field
   */
  _m_kn:string|null = null;
  _src:any = null;

  /**
   * Validation rule to use during sanitization
   * @field
   * @type {ValidationRule[]}
   */
  _val:ValidationRule[] = [];

  // sleep
  _s:any = null;

  // wakeup
  _wu:any = null;

  /**
  * Description of the property for AI
  * @field
  * @type {string|null}
  */
  _dscr:string|null = null;



  /**
   * Constructs an instance of the class.
   * Initializes the property name after validating it to ensure it is not null, undefined, or an empty string.
   *
   * @param {string} pName - The name of the property. Must not be null, undefined, or an empty string.
   * @throws {OrmException} If the provided name is null, undefined, or empty.
   * @return {void}
   */
  constructor(pName:string) {

    if(pName===null || pName===undefined || pName.match(/^[\s\t]*$/i)){
      throw OrmException.NODE_PROPERTY_HAS_EMPTY_NAME();
    }

    this._name = pName;
  }

  /**
   * To create an instance from a poor object
   *
   * @param {any} pConfig Property configuration
   * @return {NodeProperty}
   * @method
   * @static
   */
  static from(pConfig:any):NodeProperty {
    const tpl = new NodeProperty(pConfig._name);
    for(const i in pConfig){
      (tpl as IStringIndex<any>)[i] = pConfig[i]
    }
    return tpl;
  }

  /**
   * Retrieves the name associated with this instance.
   * @return {string} The name of the instance.
   */
  getName():string {
    return this._name;
  }

  /**
   * Marks the current instance as volatile, indicating that its value is subject to change and should not be cached or optimized for long-term stability.
   *
   * @return {NodeProperty} Returns the instance itself for method chaining.
   */
  volatile():NodeProperty {
    this._v = true;
    return this;
  }

  /**
   * Determines if the current object is in a volatile state.
   *
   * @return {boolean} Returns true if the object is volatile, otherwise false.
   */
  isVolatile():boolean {
    return this._v;
  }

  /**
   * Sets the uniqueness property of the NodeProperty instance.
   *
   * @param {boolean} pUnique - A boolean value that specifies whether the node property should be unique. Defaults to true.
   * @return {NodeProperty} The current instance of the NodeProperty class.
   */
  unique(pUnique = true):NodeProperty {
    this._u = pUnique;
    return this;
  }

  /**
   * Determines whether the current instance satisfies the condition of being unique.
   *
   * @return {boolean} Returns true if the instance is unique; otherwise, returns false.
   */
  isUnique():boolean {
    return this._u;
  }


  /**
   * To set data type
   *
   * @param pType
   */
  type(pType:DbDataType):NodeProperty {
    this._type = pType;
    return this;
  }

  /**
   * Retrieves the current type of the database entry.
   *
   * @return {DbDataType|null} The database type if set, or null if not set.
   */
  getType():DbDataType|null {
    return this._type;
  }


  /**
   * Sets the size of the node and returns the instance for method chaining.
   * @param {number} pSize - The size to set for the node.
   * @return {NodeProperty} The instance of the object for method chaining.
   */
  size(pSize:number):NodeProperty {
    this._size = pSize;
    return this;
  }

  /**
   * Retrieves the maximum allowable size.
   *
   * @return {number} The maximum size value.
   */
  getMaxSize():number {
    return this._size;
  }

  /**
   * To define the property is an indexed key (primary key, ...)
   *
   * @param {DbKeyType} pKeyType Key type : primary, foreign, composite, ...
   * @param {number} pOffset The offset of the key, if the key is composite
   * @return {NodeProperty} This instance. Chainable
   * @method
   */
  key(pKeyType:DbKeyType, pOffset:number = 0):NodeProperty {
    this._key = pKeyType;
    this._k_p = pOffset;
    return this;
  }

  /**
   * Retrieves the key offset value.
   *
   * @return {number} The key offset represented by a number.
   */
  getKeyOffset():number {
    return this._k_p;
  }

  /**
   * Determines if the current key is a primary key.
   *
   * @return {boolean} Returns true if the current key is a primary key, otherwise false.
   */
  isPrimaryKey():boolean {
    return (this._key == DbKeyType.PRIMARY);
  }

  /**
   * Determines if the current key is a foreign key.
   *
   * @return {boolean} true if the key is a foreign key, otherwise false.
   */
  isForeignKey():boolean {
    return (this._key == DbKeyType.FOREIGN);
  }

  /**
   * Determines whether the key is a composite key.
   *
   * @return {boolean} Returns true if the key is a composite key, otherwise false.
   */
  isCompositeKey():boolean {
    return (this._key == DbKeyType.COMPOSITE);
  }

  /**
   * Checks whether the current key matches the specified type or if the key is defined.
   *
   * @param {DbKeyType|null} [pKeyType=null] - The type of the key to check against. If null, checks if the key is defined.
   * @return {boolean} Returns true if the specified condition is met, otherwise false.
   */
  isKey(pKeyType:DbKeyType|null = null):boolean{
    if(pKeyType==null){
      return (this._key!=null);
    }else{
      return (this._key!=pKeyType);
    }
  }

  /**
   * Marks the current instance as not null by setting an internal flag.
   *
   * @return {NodeProperty} Returns the current instance for method chaining.
   */
  notnull():NodeProperty {
    this._nnull = true;
    return this;
  }

  /**
   * Checks if the value is not null.
   *
   * @return {boolean} True if the value is not null, false otherwise.
   */
  isNotNull():boolean {
    return this._nnull;
  }


  /**
   * To set a default value if the property is empty
   *
   * @param pVal
   */
  def(pVal:any):NodeProperty {
    this._def = pVal;
    return this;
  }

  /**
   * Retrieves the default value of the instance.
   * @return {any} The default value stored in the `_def` property.
   */
  getDefaultValue():any {
    return this._def;
  }

  /**
   * To set the serializing method : JSON, XML, ..
   *
   * @param {DbSerialize} pSerialize The serializing method
   * @return {NodeProperty} This instance. Chainable
   * @method
   */
  serialize(pSerialize:DbSerialize):NodeProperty{
    this._serialize = pSerialize;
    return this;
  }

  /**
   * Retrieves the serialization method associated with the instance.
   *
   * @return {DbSerialize|null} The serialization method if defined, otherwise null.
   */
  getSerializeMethod():DbSerialize|null {
    return this._serialize;
  }

  /**
   * Checks whether the object has been serialized.
   *
   * @return {boolean} Returns true if the object has a defined serialization, otherwise false.
   */
  isSerialized():boolean {
    return (this._serialize != null);
  }


  /**
   * Checks if the current data type is a boolean.
   *
   * @return {boolean} Returns true if the data type is boolean, otherwise false.
   */
  isBoolean():boolean {
    return (this._type === DbDataType.BOOLEAN);
  }


  /**
   * To set the serializing method : JSON, XML, ..
   *
   * @param {NodeType} pNodeType The node template of the instance stored into this property
   * @param {Nullable<string>} pRefPpt Default NULL. The name of the property referencing the node as INodeRef
   * @return {NodeProperty} This instance. Chainable
   * @method
   */
  single(pNodeType:NodeType, pRefPpt:Nullable<string> = null):NodeProperty{
    this._n = pNodeType;
    this._m = false;
    this._r = pRefPpt;

    if(pNodeType.hasSource())
      this.source(pNodeType.getSource());

    return this;
  }

  /**
   * Configures the node as a multiple type and optionally sets the foreign key name.
   *
   * @param {NodeType} pNodeType - The type of the node being configured.
   * @param {string|null} [pFkName=null] - The optional foreign key name to associate with the node.
   * @return {NodeProperty} The current instance of the node property after the configuration.
   */
  multiple(pNodeType:NodeType, pFkName:string|null = null):NodeProperty {
    this._m = true;
    this._m_kn = pFkName;
    this._n = pNodeType;

    if(pNodeType.hasSource())
      this.source(pNodeType.getSource());

    return this;
  }

  /**
   * Determines if the specified condition or property indicates a multiple status.
   *
   * @return {boolean} Returns true if the condition or property indicates it is a multiple, otherwise false.
   */
  isMultiple():boolean {
    return this._m;
  }

  /**
   * Retrieves the name of the target foreign key.
   *
   * @return {string|null} The name of the target foreign key if it exists, otherwise null.
   */
  getTargetFKName():string|null {
    return this._m_kn;
  }


  /**
   * Determines if the current object is a node by checking the presence of the `_n` property.
   *
   * @return {boolean} True if the `_n` property is not null, otherwise false.
   */
  isNode():boolean {
    return (this._n != null);
  }

  /**
   * Retrieves the type of the current node.
   *
   * @return {NodeType} The type of the node associated with this instance.
   * @throws {Error} If the node type is undefined.
   */
  getNodeType():NodeType {

    if(this._n==null){
      throw new Error("[ORM+CORE] A node type is used ar reference but it is not defined");
    }

    return (this._n as NodeType);
  }

  /**
   * To add a function to serialize data before sleep
   *
   * @param pFn
   */
  sleep( pFn:any){
    this._s = pFn;
    return this;
  }

  /**
   * Performs a sleep operation using the specified node property state.
   *
   * @param {NodePropertyState} pAny - The state of the node property to process.
   * @return {any} The result of the sleep operation.
   */
  doSleep( pAny:NodePropertyState):any{
    return this._s(pAny);
  }


  /**
   * To add a function to wake up data after sleep
   *
   * @param pFn
   */
  wakeUp( pFn:any):any{
    this._wu = pFn;
    return this;
  }

  /**
   * Triggers the wake-up process with the provided property state.
   *
   * @param {NodePropertyState} pAny - The property state used to perform the wake-up operation.
   * @return {*} The result of the wake-up process, possibly modified or returned data from the operation.
   */
  doWakeUp( pAny:NodePropertyState){
    return this._wu(pAny);
  }

  /**
   * Determines if the current object has a sleep state.
   *
   * @return {boolean} True if the object has a non-null sleep state, false otherwise.
   */
  hasSleep(){
    return (this._s !== null);
  }

  /**
   * Checks if the wake-up state is defined.
   *
   * @return {boolean} True if the wake-up state (_wu) is not null, otherwise false.
   */
  hasWakeUp(){
    return (this._wu !== null);
  }

  /**
   * Sets the source for the current instance.
   *
   * @param {any} pSrc - The source object or value to be set.
   * @return {any} Returns the current instance after setting the source.
   */
  source(pSrc:any):any {
    this._src = pSrc;
    return this;
  }

  /**
   * Checks if the current object has a source associated with it.
   * This method determines the presence of a source by checking the `_src` property
   * and, if not available, evaluates based on its node type.
   *
   * @return {boolean} Returns `true` if a source is present or inherited from the node type; otherwise, returns `false`.
   */
  hasSource():boolean{
    if(this._src != null) {
      return true
    }else if(this.isNode()){
      if((this.getNodeType() as NodeType).hasSource()){
        // source is inherited from node type at runtime (lazy)
        this._src = (this.getNodeType() as NodeType).getSource();
        return true;
      }else{
        // same source
        //this._src = this.getNodeType().getSource();
        return false;
      }

    }

    return false;
  }

  /**
   * Retrieves the source property of the object.
   * @return {any} The current value of the source property.
   */
  getSource():any{
    return this._src;
  }

  /**
   * To clone the current property.
   *
   * It creates a new instance
   *
   * @param {any} pOverride
   */
  clone(pOverride:any = {}):NodeProperty{
    let o = NodeProperty.from(this);
    for(const i in pOverride){
      (o as IStringIndex<any>)[i] = pOverride[i];
    }
    return o;
  }

  /**
   * To check if the property can sanitize its values or not
   *
   * @return {boolean} Returns TRUE if at least one validation rule is defined, else FALSE
   * @method
   * @since 1.0.0
   */
  isSanitizable():boolean {
    return (this._val.length > 0);
  }

  /**
   * To add a validation rule
   *
   * @param {ValidationRule} pRule The validation rule
   * @return {NodeProperty} Chainable. This instance
   * @method
   * @since 1.0.0
   */
  addValidationRule( pRule:ValidationRule):NodeProperty{
    this._val.push(pRule);
    return this;
  }


  /**
   * Shortened alias for `addValidationRule()`
   *
   * @param {ValidationRule} pRule
   * @return {NodeProperty}
   * @method
   * @since 1.0.34
   */
  rule( pRule:ValidationRule):NodeProperty{
    return  this.addValidationRule(pRule);
  }

  /**
   * To sanitize a value according to its validation rules
   *
   * @param {any} pValue Unsafe value
   * @return {IncomingValue} Encapsulqted value
   * @method
   * @since 1.0.0
   */
  sanitize(pValue:any):IncomingValue {
    if(this._val.length>0){
      let f = true;
      this._val.map( (vRule:ValidationRule) => {
        f = f && (vRule.test(pValue));
      });

      if(f){
        return new SanitizedValue(this.getName(), pValue);
      }else{
        return new UnsafeValue(this.getName(), pValue);
      }
    }else{
      return new UnsafeValue(this.getName(), pValue);
    }
  }

  /**
   * To store instance of single/multiple nodes inside the same
   * object instead of inside another collection.
   *
   * @return {NodeProperty}
   * @method
   */
  embed():NodeProperty {
    this._e = true;
    return this;
  }


  /**
   * Sets the description property with the provided text and returns the current instance.
   *
   * @param {string} pText - The text to set as the description of the purpose of this NodeProperty
   * @return {NodeProperty} The current instance with the updated description.
   */
  descr(pText:string):NodeProperty{
      this._dscr = pText;
      return this;
  }

  /**
   * To check is the property must be embedded
   *
   * @return {boolean}
   * @method
   */
  isEmbedded():boolean {
    return this._e;
  }


  /**
   * To read value of this property from a specifid object
   *
   * @param {any} pNode Any node-like object
   */
  read( pNode:any):any {
    return pNode[this.getName()];
  }


    /**
     * To export NodeProperty definition
     * @method
     */
    toJsonObject():any{
        const o:any = {
            name:this._name,
            type:(this._type), // DbDataType|null = null;
            size:this._size,
            keyType:this._key, //DbKeyType|null = null;
            composedKeyPart: this._k_p,
            isIndex: this._idx,
            notNull: this._nnull,
            defaultValue: this._def,
            serializeFormat: this._serialize, //DbSerialize|null = null;
            nodeType: (this._n!=null ? this._n.getName() : null),
            volatile: (this._v === true),
            unique: (this._u === true),
            isMultiple:(this._m === true),
            isEmbedded:(this._e === true),
            nodeRefPpt: (this._r!=null ? this._r : null),
            foreignKeyName: (this._m_kn!=null ? this._m_kn : null),
            source: (this._src!=null ? this._src : null),
            validate:(this._val.map( r => r.toJsonObject())),
            sleepHook:(this._s!=null),
            wakeupHook: (this._wu!=null),
            description: (this._dscr!=null?this._dscr:"")
        };


        return o;
    }

    static toArrayHeader( pJoin:string[] = []):string[]{
        return [
            "_name",
            "_type",
            "_size",
            "_key",
            "_k_p",
            "_idx",
            "_nnull",
            "_def",
            "_serialize",
            "_n",
            "_v",
            "_u",
            "_m",
            "_e",
            "_r",
            "_m_kn",
            "_src",
            "_val",
            "_s",
            "_wu",
            "_dscr"
        ].concat(pJoin);
    }

    toArrayValue(pNames:string[] = [], pTransform:NodeTransform = NodeTransform.NONE):any[] {
        return pNames.map((vPpt:string)=> {
            switch (vPpt){
                case "_val":
                    if([NodeTransform.NONE,NodeTransform.ARRAY].indexOf(pTransform)>=-1){
                        return this._val;
                    }else if(pTransform==NodeTransform.JSON){
                        return this._val.map( r => r.toJsonObject());
                    }else{
                        return null;
                    }

                case "_n":
                    return (this._n!=null ? this._n.getType() : -1);
                case "_s":
                case "_wu":
                    if(pTransform==NodeTransform.NONE){
                        return this[vPpt];
                    }else {
                        return null;
                    }
                default:
                    return this[vPpt];
            }
        })
    }

    /**
     *
     * @param pSchema
     */
    schema(pSchema:IJSONSchema):NodeProperty {
        this._sc = pSchema;
        return this;
    }

    /**
     *
     * @param pSchema
     */
    schemaDoc(pSchemaDoc:IJSONSchemaDocument):NodeProperty {
        this._scd = pSchemaDoc;
        return this;
    }

    toJSONSchemaDoc():IJSONSchemaDocument|null {
        return this._scd;
    }

    toJSONSchemaPart(pIsArray = false):IJSONSchema|null {
        if(pIsArray){
            return { type:"array", items: this._sc };
        }else{
            return this._sc;
        }
    }

}

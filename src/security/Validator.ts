import * as NodeBuffer from "node:buffer"
import {NodeInternalType} from "../NodeInternalType.js";
import {OperatingSystem} from "../core/OperatingSystem.js";

type StructureValidator = Record<string, ValidationRule> | ValidationRule;

type StructureValidatorTree = Record<string, StructureValidator>

export enum ValidationType {
    EQUAL,
    PINKLIST,
    REGEXP,
    CUSTOM
}

// Another fron Zod : /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i
// see alo : https://colinhacks.com/essays/reasonable-email-regex
// Same than AngularJs project
const EMAIL_REGEXP =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;


export class ValidationRule {
    private _o: any = {};

    constructor( pType:ValidationType, pOptions:any=null) {
        this.type = pType;

        if(pOptions!=null){
            switch(pType){
                case ValidationType.EQUAL:
                case ValidationType.PINKLIST:
                case ValidationType.REGEXP:
                    this.refValue = pOptions;
                    break;
                case ValidationType.CUSTOM:
                    this.testFunc = pOptions;
                    break;
            }
        }
    }

    public get type():ValidationType {
        return this._o.t;
    }

    public set type(pType:ValidationType) {
        this._o.t = pType;
    }

    public set refValue(pValue:any) {
        this._o.r = pValue;
    }

    public get refValue():any {
        return this._o.r;
    }

    public set testFunc(pFunc:Function) {
        this._o.f = pFunc;
    }

    public get testFunc():Function {
        return this._o.f;
    }

    static isRule(pObject:any):boolean {
        return (pObject!=null) && (pObject._o!=null)
            && (pObject._o.t!=null)
            && ((pObject._o.r!=null)
            || (pObject._o.f!=null));
    }


    /**
     * @since 1.0.34
     */
    static asArrayOf(vRules:ValidationRule[]):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            if(vValue==null || !Array.isArray(vValue)){
                return false;
            }

            let ctr=0;
            for (let i = 0; i < vValue.length; i++) {
                vRules.map(r => {
                    if(r.test(vValue[i])){
                        ctr++;
                    }
                });
            }
            return (ctr==(vRules.length * vValue.length));
        });
    }

    /**
     * @since 1.0.0
     */
    static newEqualAssert(pRefValue:any):ValidationRule {
        return new ValidationRule( ValidationType.EQUAL, pRefValue);
    }

    /**
     * @since 1.0.0
     */
    static newPinklistAssert(pRefValue:any):ValidationRule {
        return (new ValidationRule( ValidationType.PINKLIST, pRefValue)).z({ type: 'enum', of:pRefValue });
    }

    /**
     * @since 1.0.0
     */
    static newRegexpAssert(pRefValue:RegExp):ValidationRule {
        return (new ValidationRule( ValidationType.REGEXP, pRefValue)).z({ type: 'string', regex:pRefValue.source });
    }

    /**
     * @since 1.0.0
     */
    static newCustomAssert(pFunc:Function):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, pFunc);
    }

    /**
     * @since 1.0.34
     */
    static bool():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (vValue===true)||(vValue===false);
        })).z({ type: 'boolean' });
    }


    /**
     * @since 1.0.34
     */
    static utf8String():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return NodeBuffer.isUtf8(Buffer.from(vValue));
        })).z({ type: 'string' });
    }

    /**
     * @since 1.0.34
     */
    static utf8StringList():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.utf8String() ]).test(vValue);
        })).z({ type: 'array', of:'string' });
    }

    /**
     * @since 1.0.34
     */
    static uintString():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^([0-9]+)$/.test(vValue);
        })).z({ type: 'string', regex:'^[0-9]+$' });
    }

    /**
     * @since 1.0.34
     */
    static uintStringComposite(pSeparator:string):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uintString() ]).test(vValue.split(pSeparator));
        })).z({ type: 'array', of:'number' });
    }


    /**
     * Creates and returns a validation rule for operating systems.
     * The rule ensures the provided operating system is included in a predefined list of supported operating systems.
     *
     * @return {ValidationRule} A validation rule object configured with a list of supported operating systems.
     * @sinec 1.1.3
     */
    static os():ValidationRule {
        const range = [
            OperatingSystem.LINUX,
            OperatingSystem.ANDROID,
            OperatingSystem.TOYBOX,
            OperatingSystem.TIZEN,
            OperatingSystem.IOS,
            OperatingSystem.DARWIN,
            OperatingSystem.MACOS,
            OperatingSystem.WEB_OS,
            OperatingSystem.FIRE_OS,
            OperatingSystem.WINNT,
            OperatingSystem.NONE,
        ];
        return (new ValidationRule( ValidationType.PINKLIST, range)).z({ type: 'enum', of:range });
    }

    /**
     * @since 1.0.34
     */
    static uuid(pVersion:{version:"v1"|"v2"|"v3"|"v4"|"v5"|"v6"|"v7"|"v8"}|null = null):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(vValue);
        })).z({ type: 'uuid', of:pVersion });
    }

    /**
     * @since 1.0.34
     */
    static prefixedUuid(pPrefix:string):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return new RegExp("^"+pPrefix+"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$").test(vValue);
        })).z({ type: 'string', regex:"^"+pPrefix+"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" });
    }

    /**
     * @since 1.0.34
     */
    static uuidComposite(pSeparator:string):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue.split(pSeparator));
        })).z({ type: 'string', composite:{ type:'uuid', sep: pSeparator }});
    }

    /**
     * @since 1.0.34
     */
    static base64String():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(vValue);
        })).z({ type: 'base64' });
    }


    /**
     * @since 1.0.34
     */
    static hexColor():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^[0-9A-Fa-f]{6}$/.test(vValue);
        })).z({ type: 'hex', length:6 });
    }

    /**
     * @since 1.0.34
     */
    static email():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return EMAIL_REGEXP.test(vValue);
        })).z({ type: 'email' });
    }


    /**
     * @since 1.0.34
     */
    static uuidList():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue);
        })).z({ type: 'array', of:'uuid' });
    }

    /**
     * @since 1.0.34
     */
    static nullableObj():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            if(vValue===null || vValue===undefined){
                return true;
            }
            if(typeof vValue==='object'){
                return true;
            }
            return false;
        })).z({ type: 'nullable', of:'any' });
    }

    /**
     * @since 1.1.1
     */
    static uint64():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (typeof vValue==='number') && (vValue < Number.MAX_SAFE_INTEGER) && (vValue > Number.MIN_SAFE_INTEGER);
        })).z({ type: 'int'  });
    }

    /**
     * @param {number} pMin Minimum value include in the range of valid values
     * @param {number} pMax Maximum value include in the range of valid values
     * @since 1.1.3
     */
    static number(pMin:number, pMax:number):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (typeof vValue==='number' &&  vValue>=pMin && vValue<=pMax);
        })).z({ type: 'number', gte: pMin, lte: pMax});
    }

    /**
     *
     * @since 1.1.1
     */
    static nodeTypeID(pNullable = false, pValid:NodeInternalType[] = []):ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (pNullable? (vValue==null) : (vValue!=null) && (typeof vValue==='number') && (pValid.indexOf(vValue)>-1));
        })).z({ type:'nullable', of:{ type: 'enum', of:pValid }});
    }

    /**
     * @since 1.0.34
     */
    static emailList():ValidationRule {
        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.email() ]).test(vValue);
        })).z({ type: 'array', of:'email' });
    }

    /**
     * @since 1.0.34
     */
    static structure(pDefinition:StructureValidatorTree):ValidationRule {

        let fmt:any = {};
        function serZFmt(pZodRule:any):any{
            if(ValidationRule.isRule(pZodRule)){
                return pZodRule._o.z;
            }

            if(Array.isArray(pZodRule)){
                return { type:'array', of:(pZodRule as any[]).map( (pRule:any)=>{
                    return serZFmt(pRule)
                }) };
            }

            let o:any = {};
            for(let k in pZodRule){
                o[k] = serZFmt(pZodRule[k]);
            }
            return o;
        }

        fmt = serZFmt(pDefinition);

        return (new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{

            function isObj(v):boolean{
                //console.log(v,"isObj > ",(v==null) || (typeof v != 'object'));
                return (v!=null) && (typeof v === 'object');
            }

            function validate(s:Record<any, any>, d:StructureValidatorTree){
                for(let k in d){
                    if(s[k]==null){
                        return false
                    }

                    if(ValidationRule.isRule(d[k])){
                        if((d[k] as ValidationRule).test(s[k])===false){
                            return false;
                        }
                    }else{
                        validate(s[k],d[k] as StructureValidatorTree);
                    }
                }

                return true;
            }

            if(!isObj(vValue)) return false;

            return validate(vValue, pDefinition);
        })).z({ type: 'object', of:fmt });
    }

    test(pData:any):boolean {
        switch(this._o.t){
            case ValidationType.EQUAL:
                return (pData==this.refValue);
            case ValidationType.PINKLIST:
                return (this.refValue.indexOf(pData)>-1);
            case ValidationType.REGEXP:
                return (this.refValue).test(pData);
            case ValidationType.CUSTOM:
                return (this.testFunc)(pData);
            default:
                return false;
        }
    }

    toJsonObject():any {
        const o:any = {
            type:this.type,
            ref:(typeof this.refValue != 'function' ? this.refValue : null)
        };

        if(this._o.z!=null) o.z = this._o.z;

        return o;
    }

    z(pZodRule:any):ValidationRule {
        this._o.z = pZodRule;
        return this;
    }

    hasZodRule():boolean {
        return (this._o.z!=null);
    }
}


export interface ValidationRulesMap {
    [name:string] :ValidationRule[]
}


export class ValidationCapable {
    validator: Validator;

    constructor(pValidationRules:ValidationRulesMap) {
        this.validator = new Validator(pValidationRules);
    }

    validate(pName: string, pValue: any): boolean {
        return this.validator.validate(pName, pValue);
    }

    canValidate(pName:string):boolean {
        return this.validator.supports(pName);
    }

    getValidationErrors():ValidationError[] {
        return this.validator.getErrors();
    }
}

export class ValidationError {
    public code:number = -1;
    public msg:string = "";

    constructor( pCode:number, pMsg:string = "") {
        this.code = pCode;
        this.msg = pMsg;
    }
}

/**
 * The `Validator` class is responsible for validating input fields against a set of predefined rules.
 * It maintains a collection of validation rules and any errors that occur during the validation process.
 */
export class Validator {

    /**
     * A variable used to store an array of error objects or messages.
     *
     * This array can hold any type of data related to errors, providing
     * flexibility in the way errors are managed or logged throughout the
     * application. It is initialized as an empty array.
     *
     * Type: `any[]` - Allows storage of error information of various types.
     */
    private _err:any[] = [];
    /**
     * Represents a map of validation rules.
     *
     * The `_rules` variable is used to store a collection of validation rules
     * where the keys represent the rule names or identifiers and the values
     * describe the corresponding validation logic or configurations.
     *
     * This map is generally utilized in contexts where dynamic or named validation
     * constraints need to be defined and accessed.
     *
     * @type {ValidationRulesMap}
     */
    private _rules:ValidationRulesMap = {};

    /**
     * Creates a new instance of the class.
     *
     * @param {ValidationRulesMap} pRules - The validation rules map to be used.
     * @return {void} This constructor does not return a value.
     */
    constructor( pRules:ValidationRulesMap ) {
        this._rules = pRules;
    }

    /**
     * Checks if the provided property name is supported by evaluating
     * if it exists in the `_rules` object.
     *
     * @param {string} pName - The name of the property to check support for.
     * @return {boolean} Returns `true` if the property is supported, otherwise `false`.
     */
    supports(pName):boolean {
        return (this._rules[pName]!=null);
    }

    /**
     * Adds a validation rule for a specific parameter name.
     *
     * @param {string} pName - The name of the parameter to which the validation rule applies.
     * @param {ValidationRule} pRule - The validation rule to be added for the specified parameter name.
     * @return {Validator} Returns the instance of the Validator to allow method chaining.
     */
    addRule( pName:string, pRule:ValidationRule):Validator{
        if(this._rules[pName]==null){
            this._rules[pName] = [];
        }

        this._rules[pName].push(pRule);
        return this;
    }

    /**
     * Validates the given value against the defined validation rules of the specified field.
     *
     * @param {string} pField - The name of the field to validate.
     * @param {any} pValue - The value to be validated against the field's rules.
     * @return {boolean} Returns true if the value passes all validation rules for the specified field, otherwise false.
     */
    validate(pField:string, pValue:any):boolean {
        this.clearErrors();

        if(!this._rules.hasOwnProperty(pField)){
            this._err.push(new ValidationError(1, "Field not supported"));
            return false;
        }

        let f:boolean = true;
        this._rules[pField].map( vRule => {
            f = f && (vRule.test(pValue));
        })

        return f;
    }

    /**
     * Clears all stored errors by resetting the internal error array to an empty state.
     *
     * @return {void} Does not return a value.
     */
    clearErrors(){
        this._err = [];
    }

    /**
     * Retrieves the list of validation errors.
     *
     * @return {ValidationError[]} An array of ValidationError objects representing the errors.
     */
    getErrors():ValidationError[] {
        return this._err;
    }


}
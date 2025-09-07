import * as NodeBuffer from "node:buffer"
import {NodeInternalType} from "../NodeInternalType.js";

type StructureValidator = Record<string, ValidationRule> | ValidationRule;

type StructureValidatorTree = Record<string, StructureValidator>

export enum ValidationType {
    EQUAL,
    PINKLIST,
    REGEXP,
    CUSTOM
}

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
        return  (pObject._o!=null)
            && (pObject._o.t!=null)
            && (pObject._o.r!=null)
            && (pObject._o.f!=null);
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
        return new ValidationRule( ValidationType.PINKLIST, pRefValue);
    }

    /**
     * @since 1.0.0
     */
    static newRegexpAssert(pRefValue:RegExp):ValidationRule {
        return new ValidationRule( ValidationType.REGEXP, pRefValue);
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
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (vValue===true)||(vValue===false);
        });
    }


    /**
     * @since 1.0.34
     */
    static utf8String():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return NodeBuffer.isUtf8(Buffer.from(vValue));
        });
    }

    /**
     * @since 1.0.34
     */
    static utf8StringList():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.utf8String() ]).test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static uintString():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^([0-9]+)$/.test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static uintStringComposite(pSeparator:string):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uintString() ]).test(vValue.split(pSeparator));
        });
    }

    /**
     * @since 1.0.34
     */
    static uuid():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static prefixedUuid(pPrefix:string):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return new RegExp("^"+pPrefix+"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$").test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static uuidComposite(pSeparator:string):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue.split(pSeparator));
        });
    }

    /**
     * @since 1.0.34
     */
    static base64String():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(vValue);
        });
    }


    /**
     * @since 1.0.34
     */
    static hexColor():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^[0-9A-Fa-f]{6}$/.test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static email():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return EMAIL_REGEXP.test(vValue);
        });
    }


    /**
     * @since 1.0.34
     */
    static uuidList():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static nullableObj():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            if(vValue===null || vValue===undefined){
                return true;
            }
            if(typeof vValue==='object'){
                return true;
            }
            return false;
        });
    }

    /**
     * @since 1.1.1
     */
    static uint64():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (typeof vValue==='number') && (vValue < Number.MAX_SAFE_INTEGER) && (vValue > Number.MIN_SAFE_INTEGER);
        });
    }

    /**
     *
     * @since 1.1.1
     */
    static nodeTypeID(pNullable = false, pValid:NodeInternalType[] = []):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return (pNullable? (vValue==null) : (vValue!=null) && (typeof vValue==='number') && (pValid.indexOf(vValue)>-1));
        });
    }

    /**
     * @since 1.0.34
     */
    static emailList():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.email() ]).test(vValue);
        });
    }

    /**
     * @since 1.0.34
     */
    static structure(pDefinition:StructureValidatorTree):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{

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
        });
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

export class Validator {

    private _err:any[] = [];
    private _rules:ValidationRulesMap = {};

    constructor( pRules:ValidationRulesMap ) {
        this._rules = pRules;
    }

    supports(pName):boolean {
        return (this._rules[pName]!=null);
    }

    addRule( pName:string, pRule:ValidationRule):Validator{
        if(this._rules[pName]==null){
            this._rules[pName] = [];
        }

        this._rules[pName].push(pRule);
        return this;
    }

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

    clearErrors(){
        this._err = [];
    }

    getErrors():ValidationError[] {
        return this._err;
    }
}
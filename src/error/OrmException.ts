import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class OrmException extends MonitoredError {

    static ERRCODE_BASE = 700;


    code:number;
    extra:any;

    static ALL = {};
    static UNDEFINED_PRIMARY_KEY = (pType:any)=>{ return new OrmException(`The primary key is used but undefined [type=${pType}]`, ErrorCode.GENERIC+OrmException.ERRCODE_BASE+1) };
    static NODE_PROPERTY_HAS_EMPTY_NAME = ()=>{ return new OrmException(`A node property cannot be created with empty/null/undefined name`, ErrorCode.GENERIC+OrmException.ERRCODE_BASE+2) }

    constructor( pMsg:string, pCode = -1, pExtra:any = null) {
        super('INTERNAL+ORM', pMsg);
        this.code = pCode;
        this.extra = pExtra;
        super._triggerNewHook();
    }
}

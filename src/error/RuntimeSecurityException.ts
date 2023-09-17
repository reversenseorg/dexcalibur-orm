/**
 * Project : @dexcalibur/dexcalibur-orm-connector
 * @copyright : Reversense SAS
 * @author Georges-B. Michel <georges@reversense.com>
 */

import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {PassthroughValue } from "../security/SanitizedValue.js";

export class RuntimeSecurityException extends MonitoredError {

    static USE_OF_UNSAFE_VALUE = (pUnsafeValue:PassthroughValue)=>{ return new RuntimeSecurityException("Value is invalid",ErrorCode.SECURITY_RUNTIME + 101, pUnsafeValue) };
    static PATH_TRAVERSAL_IS_FORBIDDEN = ()=>{ return new RuntimeSecurityException("Path traversal is forbidden",ErrorCode.SECURITY_RUNTIME + 102) };
    static DB_CONNECTION_LOST = ()=>{ return new RuntimeSecurityException("Connection to backend DB is lost",ErrorCode.SECURITY_RUNTIME + 103) };


    constructor( pMsg:string, pCode:number = -1, pExtra:any = null) {
        super('RUNTIME SECURITY', pMsg, pCode, pExtra);

    }

    isEncapsulateUnsafe():boolean{
        return (this.getCode()==(ErrorCode.SECURITY_RUNTIME + 101));
    }

    bypass():PassthroughValue {
        return (this.getExtra() as PassthroughValue);
    }
}

/*
    Reversense platform / ORM core - Reversense is an automated reverse engineering and analysis platform
    focused on security, privacy, quality, accessibility and safety assessment of softwares,
    including mobile app and firmware.
    Copyright (C) 2026  Reversense SAS

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

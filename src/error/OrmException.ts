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

import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class OrmException extends MonitoredError {

    static ERRCODE_BASE = 700;


    code:number;
    extra:any;

    static ALL = {};
    static UNDEFINED_PRIMARY_KEY = (pType:any)=>{ return new OrmException(`The primary key is used but undefined [type=${pType}]`, ErrorCode.GENERIC+OrmException.ERRCODE_BASE+1) };
    static NODE_PROPERTY_HAS_EMPTY_NAME = ()=>{ return new OrmException(`A node property cannot be created with empty/null/undefined name`, ErrorCode.GENERIC+OrmException.ERRCODE_BASE+2) }
    static CANNOT_CHECK_SCHEMA_NOSCH = (pType:number, pPpt:string)=>{
        return new OrmException(`Cannot validate property value against JSON schema. Schema is messing`,
            ErrorCode.GENERIC+OrmException.ERRCODE_BASE+3,
            {
                type:pType,
                ppt:pPpt
            }) }


    constructor( pMsg:string, pCode = -1, pExtra:any = null) {
        super('INTERNAL+ORM', pMsg);
        this.code = pCode;
        this.extra = pExtra;
        super._triggerNewHook();
    }
}

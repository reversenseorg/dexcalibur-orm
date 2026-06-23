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

export enum ErrorCode {
    // IMPORTANT : DO NOT CHANGE.
    SECURITY = 90000,
    SECURITY_RUNTIME=95000,
    // 96000 is base number for error code related to DB
    GENERIC=96000
}



export class MonitoredError extends Error {

    static NEW_HOOK:((pErr:MonitoredError|null)=>void) = (()=>{});

    /**
     * Component name
     *
     * @field
     * @type string
     */
    cmp:string;
    code:number;
    extra:any;

    constructor( pCmp:string, pMsg:string, pCode = -1, pExtra:any = null) {
        super(pMsg);
        this.cmp = pCmp;
        this.code = pCode;
        this.extra = pExtra;
    }

    getCode():number {
        return this.code;
    }

    getMessage():string {
        return `[${this.cmp}][#${this.code}] ${this.message} `;
    }

    getExtra():any {
        return this.extra;
    }

    toString():string {
        return `[${this.cmp}] [#${this.code!=null ? this.code : "<null>"} ${this.message}`;
    }

    /**
     * Called by children constructors, it help to implement
     * UI action for every Exception thrown
     *
     * @method
     */
    protected _triggerNewHook(){
        MonitoredError.NEW_HOOK.apply(null,[this]);
    }

    /**
     *
     * @param pIncludeExtra
     */
    toObject(pIncludeExtra=false):any {
        return {
            cmp: this.cmp,
            code: this.code,
            msg: this.message,
            extra: pIncludeExtra ? this.extra : null
        }
    }
}

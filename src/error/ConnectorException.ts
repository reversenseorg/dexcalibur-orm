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
import {MonitoredError} from "./MonitoredError.js";

export class ConnectorException extends MonitoredError {


    constructor( pMsg:string, pCode:number = -1, pExtra:any = null) {
        super("ORM+SQLITE", pMsg, pCode, pExtra);
        super._triggerNewHook();
    }

    toString():string {
        return `[${this.cmp}] [#${this.code!=null ? this.code : "<null>"} ${this.message}`;
    }

    /**
     *
     * @param pIncludeExtra
     */
    toObject(pIncludeExtra:boolean=false):any {
        return {
            cmp: this.cmp,
            code: this.code,
            msg: this.message,
            extra: pIncludeExtra ? this.extra : null
        }
    }
}

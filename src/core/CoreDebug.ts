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

import { NodeInternalTypeName } from "../NodeInternalType.js";


/**
 * Helper to debug core feature
 *
 * @class
 */
export class CoreDebug {

    static CHECK_JSON = true;


    /**
     * Checks if the given object can be serialized into JSON format. If serialization fails,
     * it logs detailed debugging information to assist in identifying the issue.
     *
     * @param {any} pObject - The object to be checked for JSON serialization.
     * @param {string} [pSource=""] - An optional source identifier to include in debug output.
     * @return {void} This method does not return any value.
     */
    static checkJsonSerialize( pObject:any, pSource = ""):void {
        if(CoreDebug.CHECK_JSON){
            try{
                JSON.stringify(pObject);
            }catch (e){
                let s = pSource+":";
                if(pObject.hasOwnProperty("__")){
                    s += "<"+NodeInternalTypeName[pObject.__]+"> ";
                }else{
                    s += "<TYPE NONE>";
                }

                Object.keys(pObject).map(k => {
                    const t = (typeof pObject[k]);
                    if(t==="string"||t==="number"){
                        s += `${k}=${pObject[k]} , `;
                    }
                });


                console.error("[CORE DEBUG][checkJsonSerialize] "+s+"\n",e.stack);
            }
        }
    }
}
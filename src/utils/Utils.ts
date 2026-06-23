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


export interface SearchValueMatch {
    name: string;
    value: string;
}

export class Utils {


    /**
     * Searches through an object recursively to find values matching a regular expression.
     *
     * @param {RegExp} pRegexp - The regular expression used to match values.
     * @param {any} pObject - The object to be searched.
     * @param {string} pAccessPath - The current access path in the object hierarchy.
     * @param {string[]} pBlacklist - An array of keys or paths to exclude from the search.
     * @param {number} pMaxDepth - The maximum depth of recursion; use -1 for unlimited depth.
     * @param {SearchValueMatch[]} pMatches - An array to store matched results, with each match containing a name and value.
     * @param {number} [pCurrDepth=0] - The current recursion depth.
     * @return {void} This function does not return a value. Found matches are stored in the pMatches array.
     */
    static searchValue(pRegexp:RegExp, pObject: any, pAccessPath: string,
                       pBlacklist:string[], pMaxDepth:number, pMatches: SearchValueMatch[], pCurrDepth:number = 0):void {

        let basePath:string;

        if (typeof pObject === 'object'
            && (pMaxDepth==-1 || pCurrDepth <= pMaxDepth)) {

            basePath = ( pAccessPath != null ? pAccessPath+"." : "" );

            Object.keys(pObject).forEach((vKey) => {
                if (pBlacklist.indexOf(basePath + vKey) == -1)
                    Utils.searchValue(
                        pRegexp,
                        pObject[vKey],
                        basePath + vKey,
                        pBlacklist,
                        pMaxDepth,
                        pMatches,
                        pCurrDepth+1);
            });
        }
        else if (pRegexp.test(pObject)){
            pMatches.push({ name: pAccessPath, value: pObject });
        }
    }




    /**
     * Retrieves the value at the specified access path within an object.
     * The access path is a string representing nested property keys, separated by dots.
     * Returns null if the path does not exist or if the current node is not an object.
     *
     * @param {any} pObject - The object from which the value will be retrieved.
     * @param {string} pAccessPath - The dot-separated access path specifying the property to retrieve.
     * @return {any} The value at the specified access path, or null if the path or object is invalid.
     */
    static readValue(pObject: any, pAccessPath: string):any {


        const levels = pAccessPath.split('.');
        let node = pObject;

        for(let i=0; i<levels.length; i++){
            if((typeof (node) === 'object') && (node !== null) && (node !==undefined)){
                if(node.hasOwnProperty(levels[i])){
                    node = node[levels[i]];
                }else{
                    return null;
                }
            }else{
                return null;
            }
        }

        return node;
    }



    /**
     * Recursively walks over the properties of the given object and applies a callback function
     * to each property. Allows exclusions via a blacklist and supports depth limitations.
     *
     * @param {any} pObject - The object to walk over. It can be an object or any other data type.
     * @param {any} pCallback - The callback function to execute for each property.
     * @param {string} pAccessPath - The current path of the property being traversed. Helps in generating full property paths.
     * @param {string[]} pBlacklist - A list of property paths to exclude from processing.
     * @param {number} pMaxDepth - The maximum depth to traverse. Use -1 for unlimited depth.
     * @param {number} [pCurrDepth=0] - The current depth of the recursion. Defaults to 0.
     * @return {any} The result of the callback function applied to the object, if applicable.
     */
    static walkOver(pObject: any, pCallback:any, pAccessPath: string,
                    pBlacklist:string[], pMaxDepth:number,  pCurrDepth:number = 0):any {

        let basePath:string;

        if (typeof pObject === 'object'
            && (pMaxDepth==-1 || pCurrDepth <= pMaxDepth)) {

            basePath = ( pAccessPath != null ? pAccessPath+"." : "" );

            Object.keys(pObject).forEach((vKey) => {
                if (pBlacklist.indexOf(basePath + vKey) == -1)
                    Utils.walkOver(
                        pObject[vKey],
                        pCallback,
                        basePath + vKey,
                        pBlacklist,
                        pMaxDepth,
                        pCurrDepth+1);
            });
        }
        else{
            pCallback.bind(pObject);
        }
    }
}
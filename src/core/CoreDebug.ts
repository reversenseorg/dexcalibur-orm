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
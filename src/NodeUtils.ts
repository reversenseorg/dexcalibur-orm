import {INode} from "./INode";
import {Nullable} from "./core/IStringIndex";
import {SerializeOptions} from "./IJsonSerializable";

/**
 * An utility class that offers some static method to perform
 * common operation over INode or a set of INode
 *
 * @class
 */
export class NodeUtils {

    /**
     * To check if the specified object implements things required by an INode
     *
     * This method can be used to check if an object is a node
     *
     * @param {any} pObject The object to test
     * @return {boolean} TRUE if it is an INode, else FALSE
     * @method
     * @static
     */
    static isNode(pObject:any):boolean {
        if(pObject === null || pObject === undefined) return false;
        if(typeof pObject !== 'object') return false;

        let check = true;
        // check fields
        ['__','tags'].map(x => check = check && (pObject.hasOwnProperty(x)));
        // check method (a part of prototype or a field of type Function)
        ['toJsonObject','getUID'].map(x => check = check && (pObject[x]!=null));

        return check;
    }

    /**
     * To serialize INode or array of INode
     *
     *
     * @param {INode|INode[]} pObject The object or array to serialize
     * @return {any} Raw objects ready to be serialized
     * @method
     * @static
     */
    static serialize(pObject:INode|INode[], pOptions:Nullable<SerializeOptions> = null):any {

        if(Array.isArray(pObject)){
            const out:any[] = [];
            pObject.map(x => {
                if(NodeUtils.isNode(x)){
                    out.push(NodeUtils.serialize(x))
                }else{
                    out.push(x);
                }
            });
            return out;
        }else if(NodeUtils.isNode(pObject)){
            return pObject.toJsonObject(pOptions);
        }else {
            return pObject;
        }
    }
}
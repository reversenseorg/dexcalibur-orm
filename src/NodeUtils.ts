import {INode, INodeRef} from "./INode.js";
import {Nullable} from "./core/IStringIndex.js";
import {SerializeOptions} from "./IJsonSerializable.js";
import {NodeType} from "./NodeType.js";
import {ValidationRule} from "./security/Validator.js";

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
     * Serializes a single INode or an array of INode objects
     *
     * @param {INode|INode[]} pObject - The object or array of objects to be serialized. This can either be a single instance of `INode` or an array of `INode` instances.
     * @param {Nullable<SerializeOptions>} [pOptions=null] - Additional options to customize the serialization process. This parameter is optional.
     * @return {any} The serialized output, which could be an object, an array, or another data format depending on the input.
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

    static asNodeRef(pNode:any):INodeRef {

        const type = NodeType.getByID(pNode.__);
        if(type==null) return null;

        return {
            __:pNode.__,
            _uid: type.getPrimaryKey().read(pNode)
        }
    }

    /**
     * To check if the arg is strictly a INodeRef
     *
     * @param {any} pO Value to check
     * @return {boolean} TRUE if the arg is a INodeRef object, else FALSE
     * @static
     * @since 1.1.1
     */
    static isNodeRef(pO:any):boolean {
        const l = Object.entries(pO).length;
        if(l<1 || l>3) return false;
        if(l>=1 && !ValidationRule.nodeTypeID(false).test(pO.__)) return false;
        if(l>=2 && (pO._uid==null || typeof pO._uid!=="string")) return false;
        return !(l == 3 && (pO.tags == null || !ValidationRule.asArrayOf([ValidationRule.uint64()]).test(pO.tags)));
    }
}
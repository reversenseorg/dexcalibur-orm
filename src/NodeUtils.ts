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
        ['toJsonObject'].map(x => check = check && (pObject[x]!=null));

        return check;
    }
}
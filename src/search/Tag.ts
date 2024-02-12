import {CoreDebug} from "../core/CoreDebug.js";
import {INode, TagUUID} from "../INode.js";
import {TagCategory} from "./TagCategory.js";
import {NodeType} from "../NodeType.js";
import {ENodeInternalTypes, NodeInternalType} from "../NodeInternalType.js";
import {Nullable} from "../core/IStringIndex.js";

export interface TagMap {
    [hashCode:number] :Tag
}

/**
 * Option to initialize a tag
 */
export interface TagOptions {
    _?:number;
    _uid?:string;
    descr?:string;
    label?:string;
    styles?:any;
    tags?:number[];
    name?:string;
    category?:TagCategory;
}
/**
 * Tags are a way to attach properties to nodes at runtime
 *
 * @class
 */
export class Tag implements INode
{
    static TYPE:NodeType = new NodeType(
        'tag',
        ENodeInternalTypes.TAG,
        []
    );
    __:NodeInternalType = ENodeInternalTypes.TAG;

    /**
     * The TagUUID - a unique number for entire project
     * which uniquely identify the tag.
     * @type {number}
     */
    _:TagUUID;

    /**
     * Canonical UID of the tag
     * A string to uniquely identify and understand the tag
     * inside a project
     * @type {string}
     */
    _uid:string;

    /**
     * An internal name for this tag.
     *
     * It must be unique inside the parent tag category, and
     * it must allow to identify the tag inside its category.
     * The `name` is used to build the canonical UID `_uid` with
     * the parent UID.
     *
     * @type {string}
     */
    name:string;

    /**
     * The parent tag category
     */
    category:TagCategory = null;

    /**
     * Description which appear with tagged data when the user
     * ask more information.
     *
     * The description must :
     * - explain WHY the data has this tag
     * - explain WHAT is expected with such data
     *
     * @type {string}
     */
    descr:string;

    /**
     * A short label to print in place of canonical UID
     *
     * @type {string}
     */
    label:string;

    /**
     * CSS Styles to apply to UI Badge of the tag
     *
     * Keep in mind the badge must be short and clear.
     *
     * @type {any}
     */
    styles:any = {};


    /**
     * Could be used to tag a Tag object as experimental or customer defined
     *
     * @private
     */
    tags:TagUUID[] = [];


    /**
     * To create a new Tag instance
     *
     * @param {Nullable<TagOptions>} pConfig Optional. Default NULL.
     * @constructor
     */
    constructor(pConfig:Nullable<TagOptions>=null){
        if(pConfig!=null)
            for(const i in pConfig)
                this[i] = pConfig[i];

        if(this.name!=null && this.label==null){
            this.label = this.name;
        }
    }

    getFQN(){
        return this._uid;
    }

    setFQN( pFQN:string){
        this._uid = pFQN;
    }

    setUUID(pUUID:number){
        this._ = pUUID;
    }

    getUUID():number {
        return this._;
    }

    getCategory():TagCategory {
        return this.category;
    }
    /*
        getChildren():TagMap {
            return this.child;
        }*/

    get hashCode():number {
        return this._;
    }

    getUID(): string {
        return this._uid; //_uid;
    }

    /**
     * To check if the specified INode object has current tag
     *
     * @param {INode} vNode
     */
    match( vNode:INode):boolean{
        return (vNode.tags.indexOf(this.getUUID())>-1);
    }

    /**
     *
     */
    toJsonObject():any{
        const o:any = {};
        o.__ = this.__;
        o._ = this._;
        o._uid = this._uid;
        o.name = this.name;
        o.label = this.label;
        o.descr = this.descr;
        o.styles = this.styles;
        o.category = (this.category!=null ? this.category.getUID() : null);

        CoreDebug.checkJsonSerialize(o,"Tag");
        return o;
    }


}

import {ENodeInternalTypes, NodeInternalType} from "../NodeInternalType.js";
import {INode, TagUUID} from "../INode.js";
import {NodeType} from "../NodeType.js";
import { Tag } from "./Tag.js";
import {CoreDebug} from "../core/CoreDebug.js";
import { NodeProperty } from "../NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../DbAbstraction.js";
import {IStringIndex} from "../core/IStringIndex";


/**
 * Option to initiallize a tag category
 */
export interface TagCategoryOptions {
    name?:string;
    descr?:string;
    tags?:TagUUID[];
    _tags?:Tag[];
    _tagsMap?:IStringIndex<Tag>;
}

/**
 * Tag categories are conceptuals, and are only used to help to manage tags
 *
 * Tags are grouped by thema
 *
 * @class
 */
export class TagCategory implements INode
{
    static TYPE:NodeType = new NodeType(
        'tag_category',
        ENodeInternalTypes.TAG_CATEGORY,
        []
    );
    __:NodeInternalType = ENodeInternalTypes.TAG_CATEGORY;

    /**
     * Category name
     */
    name:string = null;

    /**
     * Category description
     */
    descr:string = null;

    /**
     * Tags of the category when the category is treated as any taggable node
     */
    tags:TagUUID[] = [];

    /**
     * Children tags
     * @private
     */
    private _tags:Tag[] = [];

    /**
     * Children tags indexed by name
     * @private
     */
    private _tagsMap:IStringIndex<Tag> = {};

    /**
     *
     * @param pConfig
     * @constructor
     */
    constructor(pConfig:TagCategoryOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }


    /**
     * Add a tag to the category
     *
     * @param {Tag} pTag The tag instance to add
     * @method
     */
    addTag(pTag:Tag):void{
        if(this._tagsMap[pTag.name]==null){
            this._tags.push( this._tagsMap[pTag.name] = pTag);
        }

        pTag.setFQN(this.getUID()+'.'+pTag.name);
        pTag.category = this;
    }

    /**
     * To get all tags
     *
     * @return {Tag[]} A list a tag include into the category
     * @method
     */
    getTags():Tag[]{
        return this._tags;
    }

    /**
     * To prepare a raw JS Cyclic-reference-free object ready to be serialized
     *
     * @return {any}
     * @method
     */
    toJsonObject():any{
        const o:any = {};
        o.name = this.name;
        o.descr = this.descr;
        o.tags = this.tags;
        o._tags = [];
        this._tags.map( (vTag) => {
            o._tags.push(vTag.toJsonObject());
        });
        CoreDebug.checkJsonSerialize(o,"TagCategory");
        return o;
    }

    /**
     * To create a new TagCategory instance from a raw JS object
     * @param {any} pObj Raw JS Object
     * @return {TagCategory} The fresh instance of tag category
     * @method
     * @static
     */
    static fromJsonObject(pObj:TagCategoryOptions):TagCategory {
        const cat = new TagCategory(pObj);
        if(pObj._tags!=null){
            pObj._tags.map( vTag => {
                const tag = new Tag(vTag);
                cat.addTag(tag);
            })
        }
        return cat;
    }

    /**
     * To get the UID
     * @method
     */
    getUID(): string {
        return this.name;
    }
}
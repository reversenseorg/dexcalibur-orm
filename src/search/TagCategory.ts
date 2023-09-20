import {ENodeInternalTypes, NodeInternalType} from "../NodeInternalType.js";
import {INode, TagUUID} from "../INode.js";
import {NodeType} from "../NodeType.js";
import { Tag } from "./Tag.js";
import {CoreDebug} from "../core/CoreDebug.js";
import { NodeProperty } from "../NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../DbAbstraction.js";

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
    descr:string = null;
    tags:TagUUID[] = [];

    private _tags:Tag[] = [];

    /**
     *
     * @param pConfig
     * @constructor
     */
    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    /*
    constructor(name:string, taglist:string[]){
        this.name = name;
        this.taglist = taglist;
    }

    addTag(tag:string){
        if(this.taglist.indexOf(tag)==-1)
            this.taglist.push(tag);
    }
    */

    /**
     * Add a tag to the category
     * @param pTag
     */
    addTag(pTag:Tag){
        if(this._tags.findIndex((a,b)=>{ return (a.getUUID()===pTag.getUUID()? b: -1)}) ==-1){
            pTag.setFQN(this.getUID()+'.'+pTag.name);
            pTag.category = this;
            this._tags.push(pTag);
        }
    }

    getTags():Tag[]{
        return this._tags;
    }

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
     *
     */
    getUID(): string {
        return this.name;
    }
}
TagCategory.TYPE.updateProperties([
    (new NodeProperty('name')).type(DbDataType.STRING).key(DbKeyType.PRIMARY).notnull(),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('_tags')).volatile().multiple(Tag.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
]).builder(TagCategory);
import {CoreDebug} from "../core/CoreDebug.js";
import {INode} from "../INode.js";
import {TagCategory} from "./TagCategory.js";
import {NodeType} from "../NodeType.js";
import {ENodeInternalTypes, NodeInternalType} from "../NodeInternalType.js";
import {NodeProperty} from "../NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../DbAbstraction.js";

export interface TagMap {
    [hashCode:number] :Tag
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

    _:number;

    _uid:string;
    descr:string;
    label:string;
    style:any = {};


    /**
     * Could be used to tag a Tag object as experimental or customer defined
     *
     * @private
     */
    tags:number[] = [];

    name:string;
    category:TagCategory = null;


    constructor(pConfig:any=null){
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
        o.style = this.style;
        o.category = (this.category!=null ? this.category.getUID() : null);

        CoreDebug.checkJsonSerialize(o,"Tag");
        return o;
    }


}
Tag.TYPE.updateProperties([
    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_')).type(DbDataType.NUMERIC),
    (new NodeProperty('label')).type(DbDataType.STRING),
    (new NodeProperty('name')).type(DbDataType.STRING),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('category')).single(TagCategory.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
    (new NodeProperty("style")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("{}"),
]).builder(Tag);
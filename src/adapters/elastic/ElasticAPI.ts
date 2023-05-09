
import {DbSerialize} from "../../../orm/DbAbstraction";
import {NodeProperty} from "../../../orm/NodeProperty";
import {ElasticDb} from "./ElasticDb";
import { estypes } from '@elastic/elasticsearch'
import {ElasticsearchClient } from "@kbn/core/server";
import {NodeType} from "../../../orm/NodeType";
import { IStringIndex } from "../../../orm/IStringIndex";

//let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface PreparedStatementList {
    selectSingle :any,
    selectAll :any,
    insertSingle :any,
    updateSingle :any,
    removeSingle :any,
}


export class ElasticAPI {

    _db:ElasticDb;

    _client:ElasticsearchClient;


    constructor( pDb:ElasticDb, pClient:ElasticsearchClient ) {
        this._db = pDb;
        this._client = pClient;
    }


  /**
   *  To perform a kind of enhanced toJsonObject() to make one or more object
   *  to persist
   *
   * @param pObject
   * @param pType
   */
  prepareForPersist(pObject:any, pNodeType:NodeType, pSubset:string[] = []):any {
      const out:IStringIndex = {
        __: pObject.__!=null ? pObject.__ : pNodeType.getType()
      };

      pNodeType.getProperties().map( (vPPT:NodeProperty) => {
        if(vPPT.isVolatile()) return;
        if(vPPT.getName()=="_id") return; // skip internal ID
        //if(pSubset != null && pSubset.indexOf(vPPT.getName())==-1) return;

        const name = vPPT.getName();
        if(vPPT.isNode()){
          if(! vPPT.isMultiple()){
            if(pObject[name] != null){
              out[name] = pObject[name][
                  vPPT.getNodeType()
                  .getPrimaryKey()
                  .getName()];
            }else{
              out[name] = null;
            }
          }else{
            if(vPPT.isSerialized()){
              out[name] = this._serializeProperty( pObject, vPPT);
            }else{
              out[name] = [];
              const extraPK =  vPPT.getNodeType()
                .getPrimaryKey()
                .getName();
              pObject[name].map( (x:any) => {
                out[name].push(x[extraPK]);
              });
            }
          }
        }else{
          if(vPPT.isSerialized()){
            out[name] = this._serializeProperty( pObject, vPPT);
          }else if(vPPT.isBoolean()){
            out[name] = pObject[name]===true ? true : false;
          }else if(vPPT.hasSleep()){
            out[name] = vPPT.doSleep( { p:pObject[name], self:pObject });
            // Logger.debug("====> SLEEP property "+name+" => after : "+pars[name]);
          }else{
            out[name] = pObject[name];
          }
        }
      });

      return out;
    }

    async _deleteIndex( pIndex:any){
      return this._client.indices.delete({
        index: pIndex
      })
    }

  /**
   * To create a new index in elastic DB
   *
   * @param pIndex
   */
  async _createIndex(pIndex:any):Promise<boolean>{
      let rep:estypes.IndicesCreateResponse = await this._client.indices.create({
        index: pIndex
      });

      return (rep.index==pIndex);
    }

    /**
     * To serialize a node property
     *
     * @param pObject
     * @param pProperties
     * @private
     */
    _serializeProperty( pObject:any, pProperties:NodeProperty):string {

        const name = pProperties.getName();
        let res:any = null;

        switch(pProperties.getSerializeMethod()){
            case DbSerialize.JSON:

                if(pObject[name]==null && pProperties.getDefaultValue()!==undefined){
                  pObject[name] = pProperties.getDefaultValue();
                }

                if(pProperties.isMultiple()){
                    if(Array.isArray(pObject[name])){
                        if(pObject[name].length > 0){
                            res = [];
                            pObject[name].map( (val:any) => {
                                res.push(val.hasOwnProperty('toJsonObject')? val.toJsonObject() : val[name]);
                            })
                        }else{
                            res = pObject[name];
                        }
                    }
                }else{
                    res =pObject[name].hasOwnProperty('toJsonObject')? pObject[name].toJsonObject() : pObject[name];
                }

                res = JSON.stringify(res);
                break;
            case DbSerialize.RAW:
                res = pObject[name];
                break;
        }

        return res;
    }

    /**
     * To serialize a node property
     *
     * @param pObject
     * @param pProperties
     * @private
     */
    _unserializeProperty( pObject:any, pProperty:NodeProperty):string {

        const name = pProperty.getName();
        let res:any = null;

        switch(pProperty.getSerializeMethod()){
            case DbSerialize.JSON:

                /*if(pProperty.isMultiple()){
                    res = [];
                    const tmp =  JSON.parse(res);
                    if(Array.isArray(pObject[name])){
                        if(pObject[name].length > 0){
                            res = [];
                            pObject[name].map( (val:any) => {
                                res.push(val.hasOwnProperty('toJsonObject')? val.toJsonObject() : val[name]);
                            })
                        }else{
                            res = pObject[name];
                        }
                    }
                }else{
                    //res = pObject[name].hasOwnProperty('fromJsonObject')? pProperty.builder.fromJsonObject(pObject[name]) : pObject[name];

                    res = JSON.parse(res);
                }*/
                //console.log("[ElasticAPI] _unserializeProperty(DbSerialize.JSON,"+pProperty.getName()+") : '"+pObject[name]+"' ");
                if(typeof pObject[name] === "string"){
                    res = JSON.parse(pObject[name]);
                }


                break;
            case DbSerialize.RAW:
            default:
                res = pObject[name];
                break;
        }

        return res;
    }

}

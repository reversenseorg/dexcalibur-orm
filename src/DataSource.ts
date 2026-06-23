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
import {NodeType} from "./NodeType.js";

/**
 * Represent a location where node are stored, and from where
 * it can be retrieved
 *
 * @class
 */
export class DataSource  {

  asyncSrc = false;
  name:string;
  private _fn:any = null;
  private _handlers:any = {};

  constructor( pName:string, pFind:any) {
    this.name = pName;
    this._fn = pFind;
  }

  isAsync():boolean {
    return this.asyncSrc;
  }

  getQueryFn():any {
    return this
  }

  /*
   *
   * @param pNodeType {string}
   * @private
   */
  /*private _getHandler( pNodeType:NodeType):any {
      const h = this._handlers[pNodeType.getName()];
      if(h == null){
          throw DataSourceException.NO_HANDLER_DEFINED(pNodeType.getName())
      }

      return h;
  }*/

  /**
   * To find instance for 1 node by using its UID
   *
   * @param {NodeType} pNodeType Type of node to resolve
   * @param {any} pContext
   * @param {any} pUID The node UID
   * @return {any} An instance of type <NodeType>
   * @method
   */
  find( pNodeType:NodeType, pContext:any, pUID:any):any{
    if(pUID == null) return null;

    return this._fn.single.call( null, pContext, pNodeType, pUID);
  }



  /**
   * Finds multiple entries based on the node type, context, and an array of unique identifiers.
   *
   * @param {NodeType} pNodeType - The type of node to process.
   * @param {any} pContext - A context object used during the operation.
   * @param {any[]} pUID - An array of unique identifiers for performing the search.
   * @return {any} An array of entries matching the given identifiers, or an empty array if no identifiers are provided.
   */
  findMult( pNodeType:NodeType,  pContext:any, pUID:any[]):any{

    if(pUID == null || pUID.length == 0) return [];

    if(this._fn.multi != null){
      return (this._fn.multi.call( null, pContext, pNodeType)).call( null, pUID);
    }else{
      const entries:any = [];
      const find1 = this._fn.single.call( null, pContext, pNodeType, pUID);

      pUID.map( (vUID:any)=>{
        entries.push( find1.call(null, vUID) );
      });

      return entries;
    }
  }


  /**
   * To find instance for 1 node by using its UID
   *
   * @param {NodeType} pNodeType Type of node to resolve
   * @param {any} pContext
   * @param {any} pUID The node UID
   * @return {any} An instance of type <NodeType>
   * @method
   */
   async asyncFind( pNodeType:NodeType, pContext:any, pUID:any):Promise<any>{
    if(pUID == null) return null;

    return await this._fn.single.call( null, pContext, pNodeType, pUID);
  }


  /**
   * To find all instances with specified UIDs
   *
   * @param pNodeType
   * @param pProject
   * @param pUID
   */
  async asyncFindMult( pNodeType:NodeType,  pContext:any, pUID:any[]):Promise<any>{

    if(pUID == null || pUID.length == 0) return [];

    if(this._fn.multi != null){
      return await (this._fn.multi.call( null, pContext, pNodeType)).call( null, pUID);
    }else{
      const entries:any = [];
      const find1 = await this._fn.single.call( null, pContext, pNodeType, pUID);

      pUID.map( (vUID:any)=>{
        entries.push( find1.call(null, vUID) );
      });

      return entries;
    }
  }

  /**
   *
   * @param pNodeType
   * @param pExtra
   */
  register( pNodeType:NodeType, pExtra:any):void{
    this._handlers[pNodeType.getName()] = pExtra;
  }
}

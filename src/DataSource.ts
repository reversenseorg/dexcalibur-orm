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
   * To find all instances with specified UIDs
   *
   * @param pNodeType
   * @param pProject
   * @param pUID
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

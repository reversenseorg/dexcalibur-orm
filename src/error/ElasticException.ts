import {MonitoredError} from "../../../errors/MonitoredError";


export class ElasticException extends MonitoredError {


  UNDEFINED_DB

  constructor( pMsg:string, pCode:number = -1, pExtra:any = null) {
    super("ORM+ELASTIC", pMsg, pCode, pExtra);
    super._triggerNewHook();
  }

  toString():string {
    return `[${this.cmp}] [#${this.code!=null ? this.code : "<null>"} ${this.message}`;
  }

  /**
   *
   * @param pIncludeExtra
   */
  toObject(pIncludeExtra:boolean=false):any {
    return {
      cmp: this.cmp,
      code: this.code,
      msg: this.message,
      extra: pIncludeExtra ? this.extra : null
    }
  }
}

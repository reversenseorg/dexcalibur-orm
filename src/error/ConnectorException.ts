import {MonitoredError} from "./MonitoredError";

export class ConnectorException extends MonitoredError {


    constructor( pMsg:string, pCode:number = -1, pExtra:any = null) {
        super("ORM+SQLITE", pMsg, pCode, pExtra);
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

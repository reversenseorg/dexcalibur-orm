
import { IAppContext } from './IAppContext.js';
import {IDatabaseAdapter} from "./DbAbstraction.js";
import {IStringIndex} from "./core/IStringIndex.js";
import { ConnectorFactoryException } from "./error/ConnectorFactoryException.js";
import {ConnectorFactory} from "./ConnectorFactory.js";


let gInstance:WebConnectorFactory|null = null;



interface WebConnectorMap {
  [name:string] :any;
}

export interface WebConnectorOptions {
  cluster?: string[],
  factory?: ConnectorFactory,

  [ppt:string] :any
}

export interface WebConnectorOptionsMap extends IStringIndex<any>{
  cache?: WebConnectorOptions,
}

export interface WebConnectorFactoryOptions {
  adapters?: WebConnectorOptionsMap
}


/**
 * Represent the connector factory in browser context
 *
 * @class
 */
export class WebConnectorFactory
{
    adapters:any = {};

    connectors:WebConnectorMap = {};

    options: WebConnectorFactoryOptions = {};

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
        this.connectors = {
        };
    }

    addAdapter(pAdapterConstructor:any, pName:string = null):void {
        this.adapters[pName] = pAdapterConstructor;
    }

    getAdapter(pName:string):any {
        const adapter = this.adapters[pName];
        if(adapter==null){
            throw ConnectorFactoryException.UNKNOWN_ADAPTER(pName);
        }
        return this.adapters[pName];
    }

    /**
     * To get the instance of ConnectorFactory
     *
     * @param {Boolean} pForce [Optional] Default FALSE. If TRUE, current instance is overridden
     * @returns {ConnectorFactory}
     * @method
     */
    static getInstance( pForce:boolean = false):WebConnectorFactory{
        if(gInstance === null || pForce === true){
            gInstance = new WebConnectorFactory();
        }

        return gInstance;
    }

    configure(pConfig:WebConnectorFactoryOptions){
      this.options = pConfig;
    }

    getConnector(pName:string):IDatabaseAdapter {
      if(this.connectors.hasOwnProperty(pName)===false){
        throw ConnectorFactoryException.UNKNOW_CONNECTOR(pName);
      }

      return this.connectors[pName];
    }
    /**
     * To instanciate a new connector of a specified type
     *
     * @param {String} pType Connector type. example: 'inmemory'
     * @param {DexcaliburProject} pProject Project instance
     * @param {Object} pOptions [Optional] Default NULL.
     * @method
     */
    newConnector( pType:string, pContext:IAppContext, pOptions:any = {}):IDatabaseAdapter{
        if(this.connectors.hasOwnProperty(pType)===false){
          throw ConnectorFactoryException.UNKNOW_CONNECTOR(pType);
        }

        if(this.options == null || this.options.adapters == null){
          throw ConnectorFactoryException.UNDEFINED_GLOBAL_OPTS();
        }

        if(this.options.adapters[pType] == null){
          throw ConnectorFactoryException.UNDEFINED_CONNECTOR_OPTS(pType);
        }

        this.options.adapters[pType].factory = this;

        Object.keys(this.options).map(x => {
            Object.defineProperty(this.options.adapters[pType], x, {
                value: this.options[x]
            });
        })


        //console.log(this.connectors, this.connectors[pType]);
        return new this.connectors[pType]( pContext, {
          ...pOptions,
          ...this.options.adapters[pType]
        });
    }

    /**
     * To serialize all connectors available
     *
     * @returns {Object[]} Simple object ready to be JSON-serialized
     * @method
     */
    toJsonObject():any{
        let o:any=[];
        for(let i in this.connectors){
            o.push(this.connectors[i].default.getProperties());
        }
        return o;
    }
}

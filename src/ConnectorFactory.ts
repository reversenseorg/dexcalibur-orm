
import { IAppContext } from './IAppContext.js';
import {IDatabaseAdapter} from "./DbAbstraction.js";
import {IStringIndex} from "./core/IStringIndex.js";
import { ConnectorFactoryException } from "./error/ConnectorFactoryException.js";


let gInstance:ConnectorFactory|null = null;



interface ConnectorMap {
  [name:string] :IDatabaseAdapter;
}

export interface ConnectorBasicAuth {
  name:string,
  pass:string,
  server:string,
  port:string
}

export interface ConnectorOptions {
  cluster?: string[],
  factory?: ConnectorFactory,
  auth?: ConnectorBasicAuth,
  [ppt:string] :any
}

export interface ConnectorOptionsMap extends IStringIndex<any>{
  cache?: ConnectorOptions
}

export interface ConnectorFactoryOptions {
  connectors?: ConnectorOptionsMap
}


/**
 * Represent the connector factory.
 *
 * A connector is an instance of an adapter with specific options and
 * it is attached to a context
 *
 * @class
 */
export class ConnectorFactory
{
    adapters:any = {};
    connectors:ConnectorMap = {};

    options: ConnectorFactoryOptions = {};

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
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
    static getInstance( pForce:boolean = false):ConnectorFactory{
        if(gInstance === null || pForce === true){
            gInstance = new ConnectorFactory();
        }

        return gInstance;
    }

    configure(pConfig:ConnectorFactoryOptions){
      this.options = pConfig;
    }

    getConnector(pName:string):IDatabaseAdapter {
      if(this.connectors[pName]==null){
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
        if(this.adapters[pType]==null){
          throw ConnectorFactoryException.UNKNOWN_ADAPTER(pType);
        }

        if(this.options.connectors == null){
            this.options.connectors = {};
        }

        if(this.options.connectors[pType] == null){
          this.options.connectors[pType] = {};
        }

        this.options.connectors[pType].factory = this;

        Object.keys(pOptions).map(x => {
            Object.defineProperty(this.options.connectors[pType], x, {
                value: this.options[x]
            });
        })


        // @ts-ignore
        return new (this.adapters[pType])( pContext, {
          ...pOptions,
          ...this.options.connectors[pType]
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
            // @ts-ignore
            o.push(this.connectors[i].default.getProperties());
        }
        return o;
    }
}

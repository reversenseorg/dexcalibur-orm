
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
  cache?: ConnectorOptions,
}

export interface ConnectorFactoryOptions {
  connectors?: ConnectorOptionsMap
}


/**
 * Represent the connector factory.
 *
 * @class
 */
export class ConnectorFactory
{
    connectors:ConnectorMap = {};

    options: ConnectorFactoryOptions;

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
        this.connectors = {

        };
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

        if(this.options == null || this.options.connectors == null){
          throw ConnectorFactoryException.UNDEFINED_GLOBAL_OPTS();
        }

        if(this.options.connectors[pType] == null){
          throw ConnectorFactoryException.UNDEFINED_CONNECTOR_OPTS(pType);
        }

        this.options.connectors[pType].factory = this;

        Object.keys(this.options).map(x => {
            Object.defineProperty(this.options.connectors[pType], x, {
                value: this.options[x]
            });
        })


        // @ts-ignore
        return new (this.connectors[pType])( pContext, {
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

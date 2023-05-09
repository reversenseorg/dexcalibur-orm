import { CoreStart } from "@kbn/core/server";
import CacheConnector from "./adapters/cache/CacheConnector";
import ElasticConnector from "./adapters/elastic/ElasticConnector";
import InMemoryConnector from './adapters/inmemory/InMemoryConnector';
import { IAppContext } from './IAppContext';
import {IDatabaseAdapter} from "../orm/DbAbstraction";
import {IStringIndex} from "../../IStringIndex";
import { ConnectorFactoryException } from "./ConnectorFactoryException";


let gInstance:ConnectorFactory|null = null;


export class ConnectorDb
{

}


interface ConnectorMap {
  [name:string] :any;
}

export interface ConnectorBasicAuth {
  name:string,
  pass:string,
  server:string,
  port:string
}

export interface ConnectorOptions {
  coreStart?: CoreStart, // kibana
  cluster?: string[],
  factory?: ConnectorFactory,
  auth?: ConnectorBasicAuth,
  [ppt:string] :any
}

export interface ConnectorOptionsMap extends IStringIndex{
  cache?: ConnectorOptions,
}

export interface ConnectorFactoryOptions {
  coreStart?: CoreStart,
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
          cache: CacheConnector,
          elastic: ElasticConnector,
          inmemory: InMemoryConnector
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
        // inject core setup
        this.options.connectors[pType].coreStart = this.options.coreStart;


        //console.log(this.connectors, this.connectors[pType]);
        return new this.connectors[pType]( pContext, {
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
            o.push(this.connectors[i].default.getProperties());
        }
        return o;
    }
}

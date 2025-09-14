
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

    /**
     * Adds an adapter to the collection of adapters with an optional name.
     *
     * @param {any} pAdapterConstructor - The constructor or instance of the adapter to be added.
     * @param {string} [pName=null] - The optional name to associate with the adapter. Defaults to null if not provided.
     * @return {void} This method does not return a value.
     */
    addAdapter(pAdapterConstructor:any, pName:string = null):void {
        this.adapters[pName] = pAdapterConstructor;
    }

    /**
     * Retrieves an adapter associated with the given name.
     *
     * @param {string} pName - The name of the adapter to retrieve.
     * @return {any} The adapter instance associated with the provided name.
     * @throws {ConnectorFactoryException} Throws an exception if the adapter is not available.
     */
    getAdapter(pName:string):any {
        const adapter = this.adapters[pName];
        if(adapter==null){
            throw ConnectorFactoryException.UNKNOWN_ADAPTER(pName);
        }
        return this.adapters[pName];
    }

    /**
     * Returns the singleton instance of the ConnectorFactory. If the instance does not exist
     * or the `pForce` parameter is set to true, a new instance will be created and returned.
     *
     * @param {boolean} [pForce=false] - If true, forces the creation of a new instance, even if one already exists.
     * @return {ConnectorFactory} The singleton instance of the ConnectorFactory.
     */
    static getInstance( pForce:boolean = false):ConnectorFactory{
        if(gInstance === null || pForce === true){
            gInstance = new ConnectorFactory();
        }

        return gInstance;
    }

    /**
     * Configures the current instance with the provided settings.
     *
     * @param {ConnectorFactoryOptions} pConfig - The configuration options to apply to the instance.
     * @return {void} This method does not return a value.
     */
    configure(pConfig:ConnectorFactoryOptions){
      this.options = pConfig;
    }

    /**
     * Retrieves the database connector associated with the given name.
     *
     * @param {string} pName - The name of the connector to retrieve.
     * @return {IDatabaseAdapter} The database adapter corresponding to the provided name.
     * @throws {ConnectorFactoryException} If no connector is found for the specified name.
     */
    getConnector(pName:string):IDatabaseAdapter {
      if(this.connectors[pName]==null){
        throw ConnectorFactoryException.UNKNOW_CONNECTOR(pName);
      }

      return this.connectors[pName];
    }

    /**
     * Creates a new database connector instance using the specified adapter type and context.
     * Configures the adapter with the provided options and factory-level defaults.
     *
     * @param {string} pType - The type of adapter to instantiate.
     * @param {IAppContext} pContext - The application context to be passed to the adapter.
     * @param {any} [pOptions={}] - Additional configuration options for the adapter.
     * @return {IDatabaseAdapter} The instance of the requested database adapter.
     * @throws Will throw an error if the specified adapter type is not registered.
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

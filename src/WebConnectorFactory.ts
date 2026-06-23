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

    /**
     * Adds an adapter to the adapters collection.
     *
     * @param {any} pAdapterConstructor - The constructor of the adapter to be added.
     * @param {string} [pName=null] - The optional name for the adapter. Defaults to null if not provided.
     * @return {void} This method does not return a value.
     */
    addAdapter(pAdapterConstructor:any, pName:string = null):void {
        this.adapters[pName] = pAdapterConstructor;
    }

    /**
     * Retrieves the adapter associated with the given name.
     *
     * @param {string} pName - The name of the adapter to retrieve.
     * @return {*} The adapter object associated with the specified name.
     * @throws {ConnectorFactoryException} If the adapter is not found.
     */
    getAdapter(pName:string):any {
        const adapter = this.adapters[pName];
        if(adapter==null){
            throw ConnectorFactoryException.UNKNOWN_ADAPTER(pName);
        }
        return this.adapters[pName];
    }


    /**
     * Retrieves the singleton instance of WebConnectorFactory. If the instance does not exist
     * or if forced to create a new one, it initializes a new instance.
     *
     * @param {boolean} pForce - Indicates whether to forcibly create a new instance. Defaults to false.
     * @return {WebConnectorFactory} The singleton instance of WebConnectorFactory.
     */
    static getInstance( pForce:boolean = false):WebConnectorFactory{
        if(gInstance === null || pForce === true){
            gInstance = new WebConnectorFactory();
        }

        return gInstance;
    }

    /**
     * Configures the current instance with the provided options.
     *
     * @param {WebConnectorFactoryOptions} pConfig - The configuration options to apply to the instance.
     * @return {void} This method does not return a value.
     */
    configure(pConfig:WebConnectorFactoryOptions){
      this.options = pConfig;
    }

    /**
     * Retrieves a database adapter connector by its name.
     *
     * @param {string} pName - The name of the connector to retrieve.
     * @return {IDatabaseAdapter} The database adapter associated with the specified name.
     * @throws {ConnectorFactoryException} Throws an exception if the connector is not found.
     */
    getConnector(pName:string):IDatabaseAdapter {
      if(this.connectors.hasOwnProperty(pName)===false){
        throw ConnectorFactoryException.UNKNOW_CONNECTOR(pName);
      }

      return this.connectors[pName];
    }


    /**
     * Creates and returns a new instance of a database adapter based on the specified type and configuration.
     *
     * @param {string} pType - The type of the connector to initialize. Must match a registered connector type.
     * @param {IAppContext} pContext - The application context to be used by the connector.
     * @param {any} [pOptions={}] - Additional options to override or extend the default connector options.
     * @return {IDatabaseAdapter} An instance of the requested database adapter.
     * @throws {ConnectorFactoryException} If the specified connector type is not registered.
     * @throws {ConnectorFactoryException} If the global or specific options for the connector are undefined.
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

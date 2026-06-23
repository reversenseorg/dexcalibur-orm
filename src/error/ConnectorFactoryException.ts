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

import {MonitoredError} from "./MonitoredError.js";

export class ConnectorFactoryException extends MonitoredError {

  code:number;
  extra:any;

  static ALL = {};

  static UNDEFINED_CONNECTOR_OPTS = (pConnType:string)=>{ return new ConnectorFactoryException("Connector options are required for : "+pConnType, 1401) };
  static UNDEFINED_GLOBAL_OPTS = ()=>{ return new ConnectorFactoryException("Connector factory is not configured", 1402) };
  static UNKNOW_CONNECTOR = (pConnType:string)=>{ return new ConnectorFactoryException("Invalid connector : "+pConnType, 1403) };
  static UNKNOWN_ADAPTER = (pConnType:string)=>{ return new ConnectorFactoryException("Unknow adapter : "+pConnType, 1404) };



  constructor( pMsg:string, pCode = -1, pExtra:any = null) {
    super('INTERNAL+DB:CONN', pMsg);
    this.code = pCode;
    this.extra = pExtra;
    super._triggerNewHook();
  }
}

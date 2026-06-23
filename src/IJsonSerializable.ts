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
import {IStringIndex} from "./core/IStringIndex.js";

export interface SerializeOptions {
  override?: IStringIndex<any>,
  exclude?: IStringIndex<any>,
  /**
   * A list of name of fiel to include into the value returned.
   * Others fields are ignored.
   * @type {string[]}
   */
  include?: string[],
  offset?:number,
  size?:number,
  /**
   * Extra optional field to support extra features
   * @type {any}
   */
  extra?:any
}

export interface IJsonSerializable extends IStringIndex<any>{
  toJsonObject( pOption?:SerializeOptions):any;
}
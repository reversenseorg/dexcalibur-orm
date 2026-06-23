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
/*
IMPORTANT :
-----------
This file should not include any file from project (recursive dependency)
*/

import * as Process from 'process';
import * as _fs_ from "fs";
import * as _os_ from "os";

let PRINT:((str:any|any[])=>void);


const LOG_DEF_FILE = false;
const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : LOG_DEF_FILE);


if(LOG_FILE)
  PRINT = function ( pMessage:string){
    _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
  };
else
  PRINT = console.log;



class LoggerAction {
  static exit(){
    Process.exit();
  }
}

export enum MessageType {
  T_ERROR = 1,
  T_INFO = 2,
  T_DEBUG = 3,
  T_WARN = 4,
  T_RAW = 5,
  T_SUCCESS = 6,
  T_DEBUG_RAW
}

interface TestMessage {
  type: MessageType,
  val: any
}

/**
 * To concate several strings contained into an array and return a string
 *
 * @param msg String[] An array of string
 * @function
 */
function multi_concat(msg:any[]):string{
  let ret:string="";
  for(let i=0; i<msg.length; i++)
    ret += msg[i];

  return ret;
}


export interface Logger {

  prefix: string[];
  debugEnabled: boolean;

  error(...args:string[]):LoggerAction;
  debug(...args:string[]):LoggerAction;
  debugPink(...args:string[]):LoggerAction;
  debugRAW(...args:any[]):LoggerAction;
  debugBgRed(...args :any[]):LoggerAction;
  info(...args:string[]):LoggerAction;
  warn(...args:string[]):LoggerAction;
  success(...args:string[]):LoggerAction;
  raw(...args:string[]):LoggerAction;
  pop():string|undefined;
  push(prefix:string):string[];
}


export class TestLogger implements Logger
{

  prefix: string[] = [];
  cache: TestMessage[] = [];
  cacheTag: string|null = null;
  debugEnabled: boolean = false;

  constructor(debugMode:boolean){
    this.debugEnabled = debugMode;
  }

  error(...args :any[]):LoggerAction{
    this.cache.push( { type:MessageType.T_ERROR, val:multi_concat(args) });
    return LoggerAction;
  }

  debug(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
    return LoggerAction;
  }

  debugPink(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
    return LoggerAction;
  }

  debugBgRed(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
    return LoggerAction;
  }

  debugRAW(...args :any[]):LoggerAction{
    this.cache.push({ type:MessageType.T_DEBUG_RAW, val:args });
    return LoggerAction;
  }

  info(...args :any[]):LoggerAction{
    this.cache.push({ type:MessageType.T_INFO, val:multi_concat(args) });
    return LoggerAction;
  }

  warn(...args :any[]):LoggerAction{
    this.cache.push({ type:MessageType.T_WARN, val:multi_concat(args) });
    return LoggerAction;
  }

  success(...args :any[]):LoggerAction{
    this.cache.push({ type:MessageType.T_SUCCESS, val:multi_concat(args) });
    return LoggerAction;
  }

  raw(...args :any[]):LoggerAction{
    this.cache.push({ type:MessageType.T_RAW, val:multi_concat(args) });
    return LoggerAction;
  }

  setTagCache(tag:string){
    this.cacheTag = tag;
  }


  expect(expected:TestMessage, fn:any =null):boolean{
    let f = false;
    this.cache.map(x => {
      if(x.type==expected.type){
        if(typeof fn == "function")
          f = fn(expected, x);
        else
          f = (x.val===expected.val);
      }
    });
    return f;
  }

  clearCache(){
    this.cache = [];
  }

  pop():string|undefined{
    return this.prefix.pop()
  }

  push(prefix:string): string[]{
    this.prefix.push(prefix);
    return this.prefix;
  }
}


export class ProdLogger implements Logger
{
  prefix: string[] = [];
  debugEnabled: boolean = false;

  constructor(debugMode:boolean){
    this.prefix = [];
    this.debugEnabled = debugMode;
  }

  enableDebug(){
    this.debugEnabled = true;
  }

  error(...args :any[]):LoggerAction{
    PRINT('[ERROR] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }

  debug(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      PRINT('[DEBUG] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }


  debugRAW(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      PRINT(args);
    return LoggerAction;
  }

  /**
   * TODO : TestLogger
   */
  debugPink(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      PRINT('[DEBUG] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }


  debugBgRed(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      PRINT('[DEBUG] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }

  warn(...args :any[]):LoggerAction{
    if(this.debugEnabled)
      PRINT('[DEBUG] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }

  success(...args :any[]):LoggerAction{
    PRINT(this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }

  info(...args :any[]):LoggerAction{
    PRINT('[INFO] '+this.prefix.join("")+multi_concat(args));
    return LoggerAction;
  }

  raw(...args :any[]):LoggerAction{
    PRINT(multi_concat(args));
    return LoggerAction;
  }

  pop():string|undefined{
    return this.prefix.pop()
  }

  push(prefix:string):string[]{
    this.prefix.push(prefix);
    return this.prefix;
  }
}


let loggerInstance:TestLogger|ProdLogger|null = null;


export function newLogger(config:any =null, override:boolean =false):TestLogger|ProdLogger {
  if(loggerInstance===null || override){
    if(config===null){
      config={
        testMode: false,
        debugMode: false
      };
    }

    if(config!=null && config.testMode)
      loggerInstance = new TestLogger(config.debugMode);
    else
      loggerInstance = new ProdLogger(config.debugMode);
  }

  return loggerInstance;
}

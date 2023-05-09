import {SearchAPI} from "../../search/SearchAPI";
import {UserContext} from "../../../server/core/UserContext";

export enum AppContextType {
  WEB_CLIENT,
  WEB_SERVER
}

export interface IAppContext {
  _type:AppContextType;

  getDomain():any;

  getSearchAPI():SearchAPI;

  getUserContext():UserContext|null;
}


export enum AppContextType {
  WEB_CLIENT,
  WEB_SERVER
}

export interface IAppContext {
  _type:AppContextType;
}

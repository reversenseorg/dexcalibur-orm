import { NodeInternalType } from "../../../orm/NodeInternalType";

export enum OPE {
  CREATE_DATA,
  READ_DATA,
  UPDATE_DATA,
  DELETE_DATA,
  CREATE_INDEX,
  DELETE_INDEX,
  NEED_CACHE
}

export enum FLUSH_POLICY {
  NO_ATOMIC_FLUSH,

  /**
   * To remove first oldest record from cache
   */
  OLDEST,

  /**
   * To remove first data less used
   */
  USELESS
}

export interface IndexCachePolicy {
  cacheType: string[], // connector names
  cacheSize: number, // max nb of entries
  refreshAfter: OPE[], // when cache must be flush
  flushPolicy: FLUSH_POLICY, // how choose entries to evict
  objectTypes: NodeInternalType[]
}

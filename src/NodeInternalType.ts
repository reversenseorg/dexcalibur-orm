export type NodeInternalType = number;

export interface NodeInternalTypeMapping {
  [name:string]:NodeInternalType
}
export const ENodeInternalTypes:NodeInternalTypeMapping = {
  NONE: 0,
  TAG_CATEGORY: 100000,
  TAG: 100001
}

export const NodeInternalTypeName = {
  [ENodeInternalTypes.NONE]: "NONE",
  [ENodeInternalTypes.TAG_CATEGORY]: "TAG_CATEGORY",
  [ENodeInternalTypes.TAG]: "TAG",
}
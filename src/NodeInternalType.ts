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
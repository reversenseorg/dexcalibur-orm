 import {ConnectorBasicAuth, ConnectorFactory, ConnectorOptions } from "./src/ConnectorFactory.js";
import { DataSourceHelper } from "./src/DataSourceHelper.js";
import { DataSource } from "./src/DataSource.js";
import { DbDataType, DbKeyType, IDatabase, IDatabaseAdapter, DbSetMap, DbSizesMap, IDbCollection, IDbIndex, IDbSet, DbSetType, DbSerialize  } from "./src/DbAbstraction.js";
import {DbEvent, ObjType, OpCode } from "./src/DbEvent.js";
import { ConnectorFactoryException } from "./src/error/ConnectorFactoryException.js";
import {AppContextType, IAppContext } from "./src/IAppContext.js";
import { IJsonSerializable, SerializeOptions } from "./src/IJsonSerializable.js";
import { INode, INodeMap, Node, TagUUID } from "./src/INode.js";
import {ENodeInternalTypes, NodeInternalType, NodeInternalTypeMapping, NodeInternalTypeName } from "./src/NodeInternalType.js";
import { NodeProperty, NodePropertyState } from "./src/NodeProperty.js";
import {NodeInternalTypeMap, NodePropertyMap, NodeType, NodeTypeMap, NodeListenersMap } from "./src/NodeType.js";
import { WebConnectorFactory, WebConnectorFactoryOptions, WebConnectorOptions, WebConnectorOptionsMap } from "./src/WebConnectorFactory.js";
import { OrmException } from "./src/error/OrmException.js";
import { MonitoredError } from "./src/error/MonitoredError.js";
import { RuntimeSecurityException } from "./src/error/RuntimeSecurityException.js";
import { ConnectorException } from "./src/error/ConnectorException.js";
import {PassthroughValue, SanitizedValue, UnsafeValue } from "./src/security/SanitizedValue.js";
import {ValidationCapable, ValidationError, ValidationRule, ValidationRulesMap, ValidationType, Validator } from "./src/security/Validator.js";
import {MessageType, newLogger, ProdLogger, TestLogger } from "./src/utils/Logger.js";
import { IStringIndex } from "./src/core/IStringIndex.js";
import { TagCategory } from "./src/search/TagCategory.js";
import { Tag } from "./src/search/Tag.js";


Tag.TYPE.updateProperties([
    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_')).type(DbDataType.NUMERIC),
    (new NodeProperty('label')).type(DbDataType.STRING),
    (new NodeProperty('name')).type(DbDataType.STRING),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('category')).single(TagCategory.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
    (new NodeProperty("styles")).type(DbDataType.STRING).def({}),
]).builder(Tag);


TagCategory.TYPE.updateProperties([
    (new NodeProperty('name')).type(DbDataType.STRING).key(DbKeyType.PRIMARY).notnull(),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('_tags')).volatile().multiple(Tag.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).def("[]"),
]).builder(TagCategory);

export {
    IAppContext,
    AppContextType,
    INode,
    INodeMap,
    Node,
    TagUUID,
    NodeType,
    NodeTypeMap,
    NodeListenersMap,
    NodeProperty,
    NodePropertyState,
    NodePropertyMap,
    NodeInternalType,
    NodeInternalTypeMapping,
    NodeInternalTypeMap,
    WebConnectorFactory,
    WebConnectorOptions,
    WebConnectorOptionsMap,
    WebConnectorFactoryOptions,
    IJsonSerializable,
    SerializeOptions,
    OpCode,
    ObjType,
    DbEvent,
    DbDataType,
    DbKeyType,
    DbSerialize,
    DbSetType,
    IDbSet,
    IDbIndex,
    IDbCollection,
    DbSizesMap,
    DbSetMap,
    IDatabaseAdapter,
    IDatabase,
    DataSourceHelper,
    DataSource,
    ConnectorFactory,
    ConnectorBasicAuth,
    ConnectorOptions,
    ConnectorException,
    ConnectorFactoryException,
    OrmException,
    MonitoredError,
    RuntimeSecurityException,
    SanitizedValue,
    PassthroughValue,
    UnsafeValue,
    Validator,
    ValidationRule,
    ValidationType,
    ValidationRulesMap,
    ValidationCapable,
    ValidationError,
    newLogger,
    ProdLogger,
    TestLogger,
    MessageType,
    IStringIndex,
    Tag,
    TagCategory,
    NodeInternalTypeName,
    ENodeInternalTypes
};
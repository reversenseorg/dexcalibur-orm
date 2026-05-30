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
import {NodeInternalTypeMap, NodePropertyMap, NodeType, NodeTypeMap, NodeListenersMap, NodeTransform } from "./src/NodeType.js";
import { WebConnectorFactory, WebConnectorFactoryOptions, WebConnectorOptions, WebConnectorOptionsMap } from "./src/WebConnectorFactory.js";
import { OrmException } from "./src/error/OrmException.js";
import { MonitoredError } from "./src/error/MonitoredError.js";
import { RuntimeSecurityException } from "./src/error/RuntimeSecurityException.js";
import { ConnectorException } from "./src/error/ConnectorException.js";
import {PassthroughValue, SanitizedValue, UnsafeValue } from "./src/security/SanitizedValue.js";
import {ValidationCapable, ValidationError, ValidationRule, ValidationRulesMap, ValidationType, Validator } from "./src/security/Validator.js";
import {MessageType, newLogger, ProdLogger, TestLogger } from "./src/utils/Logger.js";
import { IStringIndex } from "./src/core/IStringIndex.js";
import { TagCategory, TagCategoryOptions } from "./src/search/TagCategory.js";
import { Tag, TagOptions } from "./src/search/Tag.js";
 import { NodeUtils } from "./src/NodeUtils.js";
 import {defineSchema, IJSONSchema, IJSONSchemaDocument, JsonSchemaOpts } from "./src/utils/JSONSchema.js";
 import { JSONSchemaValidator, ValidationResult } from "./src/utils/JSONSchemaValidator.js";


Tag.TYPE.updateProperties([
    (new NodeProperty('_uid'))
        .type(DbDataType.STRING)
        .schema({ type: "string" })
        .descr("Canonical UID of the tag. This UID has always the following format <TagCategory.name>:<Tag.name>")
        .key(DbKeyType.PRIMARY),
    (new NodeProperty('_'))
        .type(DbDataType.NUMERIC)
        .schema({ type: "number" })
        .descr("The internal numeric UID of the tag. This UID is unique per DexcaliburProject but can differ from another project. Only `_uid` property are common to other projects"),
    (new NodeProperty('label'))
        .schema({ type: "string" })
        .descr("The Label in GUI and reports for this tags")
        .type(DbDataType.STRING),
    (new NodeProperty('name'))
        .schema({ type: "string", pattern: "^[a-zA-Z0-9_]+$" })
        .descr("ID of the tag. Support only alphanumeric et _ char. It is used to uniquely identify Tag within the parent TagCategory.")
        .type(DbDataType.STRING),
    (new NodeProperty('descr'))
        .schema({ type: "string" })
        .descr("Information about the purpose of this tag or the meaning of a node tagged by itself. Used in GUI and reports.")
        .type(DbDataType.STRING),
    (new NodeProperty('category'))
        .single(TagCategory.TYPE),
    (new NodeProperty('extra'))
        .schema({ type: "object" })
        .descr("Optional, additional properties for this tag.")
        .type(DbDataType.BLOB).def({}),
    (new NodeProperty("tags"))
        .schema({ type: "object" })
        .descr("List of topics used to help the final user to search a Tag by its topics")
        .type(DbDataType.STRING).def([]),
    (new NodeProperty("styles"))
        .schema({ type: "object" })
        .descr("Styles to apply to the tag to display it in GUI and reports.")
        .type(DbDataType.STRING).def({}),
]).builder(Tag);


TagCategory.TYPE.updateProperties([
    (new NodeProperty('name'))
        .schema({ type: "string" })
        .descr("The identifier and human-readable name of the tag category. Must be the topic of enclosed tags")
        .type(DbDataType.STRING).key(DbKeyType.PRIMARY).notnull(),
    (new NodeProperty('descr'))
        .schema({ type: "string" })
        .descr("Information about the purpose of this category and tags enclosed in.")
        .type(DbDataType.STRING),
    (new NodeProperty('_tags'))
        .volatile()
        .descr("Children tags of this category. Used internally by Dexcalibur to manage tags.")
        .multiple(Tag.TYPE),
    (new NodeProperty("tags"))
        .descr("List of topics used to help the final user to search a Tag by its topics")
        .schema(Tag.TYPE.getProperty('_').toJSONSchemaPart(true))
        .type(DbDataType.STRING).def([]),
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
    NodeUtils,
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
    ValidationResult,
    newLogger,
    ProdLogger,
    TestLogger,
    MessageType,
    IStringIndex,
    Tag,
    TagCategory,
    TagOptions,
    TagCategoryOptions,
    NodeInternalTypeName,
    ENodeInternalTypes,
    NodeTransform,
    IJSONSchema,
    IJSONSchemaDocument,
    JSONSchemaValidator,
    defineSchema,
    JsonSchemaOpts
};
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
/**
 * JSON Schema Draft 2020-12 Type Definitions
 *
 * Based on https://json-schema.org/draft/2020-12/json-schema-core
 * and https://json-schema.org/draft/2020-12/json-schema-validation
 */

/**
 * Primitive types defined in JSON Schema
 */
export type JSONSchemaType =
    | 'null'
    | 'boolean'
    | 'object'
    | 'array'
    | 'number'
    | 'string'
    | 'integer';

/**
 * String format validators
 */
export type JSONSchemaStringFormat =
// Date and time formats
    | 'date-time'  // RFC 3339
    | 'date'       // RFC 3339
    | 'time'       // RFC 3339
    | 'duration'   // RFC 3339
    // Email formats
    | 'email'
    | 'idn-email'
    // Hostname formats
    | 'hostname'
    | 'idn-hostname'
    // IP addresses
    | 'ipv4'
    | 'ipv6'
    // Resource identifiers
    | 'uri'
    | 'uri-reference'
    | 'iri'
    | 'iri-reference'
    | 'uri-template'
    // JSON Pointer
    | 'json-pointer'
    | 'relative-json-pointer'
    // Regular expression
    | 'regex'
    // UUID
    | 'uuid';

/**
 * Metadata keywords
 */
export interface IJSONSchemaMetadata {
    /**
     * Title of the schema
     */
    title?: string;

    /**
     * Description of the schema
     */
    description?: string;

    /**
     * Default value
     */
    default?: any;

    /**
     * Indicates the value is deprecated
     */
    deprecated?: boolean;

    /**
     * Indicates that the value should not be modified
     */
    readOnly?: boolean;

    /**
     * Indicates that the value should not be read
     */
    writeOnly?: boolean;

    /**
     * Example values (single or array)
     */
    examples?: any[];
}

/**
 * Core vocabulary keywords
 */
export interface IJSONSchemaCore {
    /**
     * The $schema keyword - identifies the dialect
     */
    $schema?: string;

    /**
     * The $id keyword - identifies the schema resource
     */
    $id?: string;

    /**
     * The $ref keyword - references a schema
     */
    $ref?: string;

    /**
     * The $anchor keyword - defines a plain name fragment
     */
    $anchor?: string;

    /**
     * The $dynamicRef keyword - references a schema dynamically
     */
    $dynamicRef?: string;

    /**
     * The $dynamicAnchor keyword - defines a dynamic anchor
     */
    $dynamicAnchor?: string;

    /**
     * The $vocabulary keyword - declares vocabularies
     */
    $vocabulary?: {
        [vocabularyUri: string]: boolean;
    };

    /**
     * The $comment keyword - adds comments
     */
    $comment?: string;

    /**
     * The $defs keyword - defines reusable schemas
     */
    $defs?: {
        [key: string]: IJSONSchema;
    };
}

/**
 * Validation keywords for any instance type
 */
export interface IJSONSchemaValidation {
    /**
     * Type of the instance
     */
    type?: JSONSchemaType | JSONSchemaType[];

    /**
     * Enum - value must be one of these
     */
    enum?: any[];

    /**
     * Const - value must be exactly this
     */
    const?: any;
}

/**
 * Validation keywords for numeric instances (number and integer)
 */
export interface IJSONSchemaNumeric {
    /**
     * Multiple of
     */
    multipleOf?: number;

    /**
     * Maximum value (inclusive)
     */
    maximum?: number;

    /**
     * Exclusive maximum value
     */
    exclusiveMaximum?: number;

    /**
     * Minimum value (inclusive)
     */
    minimum?: number;

    /**
     * Exclusive minimum value
     */
    exclusiveMinimum?: number;
}

/**
 * Validation keywords for strings
 */
export interface IJSONSchemaString {
    /**
     * Maximum length
     */
    maxLength?: number;

    /**
     * Minimum length
     */
    minLength?: number;

    /**
     * Pattern (regular expression)
     */
    pattern?: string;

    /**
     * Format
     */
    format?: JSONSchemaStringFormat | string;

    /**
     * Content media type
     */
    contentMediaType?: string;

    /**
     * Content encoding
     */
    contentEncoding?: string;

    /**
     * Content schema
     */
    contentSchema?: IJSONSchema;
}

/**
 * Validation keywords for arrays
 */
export interface IJSONSchemaArray {
    /**
     * Items schema (applies to all items)
     */
    items?: IJSONSchema;

    /**
     * Prefix items (array of schemas for corresponding items)
     */
    prefixItems?: IJSONSchema[];

    /**
     * Contains - at least one item must be valid against this schema
     */
    contains?: IJSONSchema;

    /**
     * Maximum number of items
     */
    maxItems?: number;

    /**
     * Minimum number of items
     */
    minItems?: number;

    /**
     * Unique items
     */
    uniqueItems?: boolean;

    /**
     * Maximum number of items that must be valid against contains
     */
    maxContains?: number;

    /**
     * Minimum number of items that must be valid against contains
     */
    minContains?: number;

    /**
     * Unevaluated items
     */
    unevaluatedItems?: IJSONSchema | boolean;
}

/**
 * Validation keywords for objects
 */
export interface IJSONSchemaObject {
    /**
     * Properties
     */
    properties?: {
        [key: string]: IJSONSchema;
    };

    /**
     * Pattern properties
     */
    patternProperties?: {
        [pattern: string]: IJSONSchema;
    };

    /**
     * Additional properties
     */
    additionalProperties?: IJSONSchema | boolean;

    /**
     * Unevaluated properties
     */
    unevaluatedProperties?: IJSONSchema | boolean;

    /**
     * Required properties
     */
    required?: string[];

    /**
     * Property names (schema for property names)
     */
    propertyNames?: IJSONSchema;

    /**
     * Maximum number of properties
     */
    maxProperties?: number;

    /**
     * Minimum number of properties
     */
    minProperties?: number;

    /**
     * Dependent required
     */
    dependentRequired?: {
        [key: string]: string[];
    };

    /**
     * Dependent schemas
     */
    dependentSchemas?: {
        [key: string]: IJSONSchema;
    };
}

/**
 * Applicator keywords
 */
export interface IJSONSchemaApplicator {
    /**
     * All of - must be valid against all schemas
     */
    allOf?: IJSONSchema[];

    /**
     * Any of - must be valid against at least one schema
     */
    anyOf?: IJSONSchema[];

    /**
     * One of - must be valid against exactly one schema
     */
    oneOf?: IJSONSchema[];

    /**
     * Not - must not be valid against the schema
     */
    not?: IJSONSchema;

    /**
     * If schema
     */
    if?: IJSONSchema;

    /**
     * Then schema (used with if)
     */
    then?: IJSONSchema;

    /**
     * Else schema (used with if)
     */
    else?: IJSONSchema;
}
/**
 * Complete JSON Schema interface (Draft 2020-12)
 */
export interface IJSONSchema
    extends IJSONSchemaCore,
        IJSONSchemaMetadata,
        IJSONSchemaValidation,
        IJSONSchemaNumeric,
        IJSONSchemaString,
        IJSONSchemaArray,
        IJSONSchemaObject,
        IJSONSchemaApplicator {
    /**
     * Additional custom properties
     */
    [key: string]: any;
}

/**
 * JSON Schema can also be a boolean
 * - true: always valid
 * - false: always invalid
 */
export type JSONSchema = IJSONSchema | boolean;

/**
 * Root JSON Schema document
 */
export interface IJSONSchemaDocument extends IJSONSchema {
    /**
     * Required: Schema version
     */
    $schema: string;
}

/**
 * Helper type for creating typed schemas
 */
export interface IJSONSchemaTyped<T extends JSONSchemaType> extends IJSONSchema {
    type: T;
}


/**
 * Helper pour inférer le type TypeScript depuis un JSON Schema
 */
export type InferSchemaType<T extends IJSONSchema> =
    T extends { type: 'string' } ? string :
        T extends { type: 'number' } ? number :
            T extends { type: 'integer' } ? number :
                T extends { type: 'boolean' } ? boolean :
                    T extends { type: 'null' } ? null :
                        T extends { type: 'array'; items: infer I } ?
                            (I extends IJSONSchema ? InferSchemaType<I>[] : any[]) :
                            T extends { type: 'object'; properties: infer P } ?
                                { [K in keyof P]: P[K] extends IJSONSchema ? InferSchemaType<P[K]> : any } :
                                any;




/**
 * Type guard pour vérifier si une valeur est un JSONSchema valide
 */
export function isJSONSchema(value: any): value is IJSONSchema {
    if (typeof value === 'boolean') {
        return true;
    }

    if (typeof value !== 'object' || value === null) {
        return false;
    }

    // Vérification basique : au moins un mot-clé JSON Schema
    const keywords = [
        '$schema', '$id', '$ref', 'type', 'properties', 'items',
        'required', 'enum', 'const', 'allOf', 'anyOf', 'oneOf', 'not'
    ];

    return keywords.some(keyword => keyword in value);
}

/**
 * Créer un schéma typé avec inférence automatique
 */
export function defineSchema<T extends IJSONSchema>(schema: T): T & { __inferred: InferSchemaType<T> } {
    return schema as any;
}

export interface JsonSchemaOpts {
    required?: string[];
    id?:string;

}
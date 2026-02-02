/**
 * JSON Schema Validator (Draft 2020-12)
 *
 * Validates JavaScript objects against JSON Schema definitions
 */

import {IJSONSchema, JSONSchemaType, JSONSchema, IJSONSchemaDocument} from './JSONSchema.js';


/**
 * Validation error details
 */
export interface ValidationError {
    /**
     * JSON Pointer to the location in the instance where the error occurred
     */
    instancePath: string;

    /**
     * JSON Pointer to the location in the schema
     */
    schemaPath: string;

    /**
     * Keyword that failed validation
     */
    keyword: string;

    /**
     * Error message
     */
    message: string;

    /**
     * Additional parameters
     */
    params?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
    /**
     * Whether the instance is valid
     */
    valid: boolean;

    /**
     * List of validation errors (empty if valid)
     */
    errors: ValidationError[];
}

/**
 * JSON Schema Validator
 */
export class JSONSchemaValidator {
    private errors: ValidationError[] = [];
    private schemas: Map<string, IJSONSchema> = new Map();

    static toJsonSchemaDoc(pSchema:IJSONSchema):IJSONSchemaDocument{
        return {
            $schema: "http://json-schema.org/draft-07/schema#",
            ...pSchema
        }
    }

    constructor() {
    }

    /**
     * Validates an instance against a JSON Schema
     *
     * @param {any} instance - The instance to validate
     * @param {JSONSchema} schema - The JSON Schema
     * @param {any[]|null} schema - Array where error should be store if not in instance
     * @return {ValidationResult} The validation result
     */
    validate(instance: any, schema: JSONSchema, pExternalErr:any[]|null = null): ValidationResult {
        this.errors = [];

        // Boolean schemas
        if (typeof schema === 'boolean') {
            if (!schema) {
                this.addError('', '', 'false', 'Schema is false, always fails validation', null, pExternalErr);
            }
            return this.getResult();
        }

        this.validateSchema(instance, schema, '#', '#', pExternalErr);
        return this.getResult();
    }


    /**
     * Registers a schema for $ref resolution
     *
     * @param {string} uri - The schema URI ($id)
     * @param {IJSONSchema} schema - The schema
     */
    registerSchema(uri: string, schema: IJSONSchema): void {
        this.schemas.set(uri, schema);
    }

    /**
     * Main validation logic
     */
    private validateSchema(
        instance: any,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {

        // Handle $ref
        if (schema.$defs) {
            for(let id in schema.$defs){
                this.registerSchema("#/$defs/"+id, schema.$defs[id]);
            }
        }

        // Handle $ref
        if (schema.$ref) {
            const resolvedSchema = this.resolveRef(schema.$ref, schema);
            if (resolvedSchema) {
                this.validateSchema(instance, resolvedSchema, instancePath, `${schemaPath}/$ref`, pExternalErr);
            }
            return;
        }

        // Validate type
        if (schema.type) {
            this.validateType(instance, schema.type, instancePath, `${schemaPath}/type`, pExternalErr);
        }

        // Validate const
        if (schema.const !== undefined) {
            this.validateConst(instance, schema.const, instancePath, `${schemaPath}/const`, pExternalErr);
        }

        // Validate enum
        if (schema.enum) {
            this.validateEnum(instance, schema.enum, instancePath, `${schemaPath}/enum`, pExternalErr);
        }

        // Type-specific validations
        const actualType = this.getType(instance);

        if (actualType === 'string') {
            this.validateString(instance, schema, instancePath, schemaPath, pExternalErr);
        } else if (actualType === 'number' || actualType === 'integer') {
            this.validateNumeric(instance, schema, instancePath, schemaPath, pExternalErr);
        } else if (actualType === 'array') {
            this.validateArray(instance, schema, instancePath, schemaPath, pExternalErr);
        } else if (actualType === 'object') {
            this.validateObject(instance, schema, instancePath, schemaPath, pExternalErr);
        }

        // Logical operators
        this.validateLogicalOperators(instance, schema, instancePath, schemaPath, pExternalErr);

        // Conditional validation
        this.validateConditional(instance, schema, instancePath, schemaPath, pExternalErr);
    }

    /**
     * Validate type keyword
     */
    private validateType(
        instance: any,
        type: JSONSchemaType | JSONSchemaType[],
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        const actualType = this.getType(instance);
        const types = Array.isArray(type) ? type : [type];

        let valid = false;
        for (const t of types) {
            if (t === actualType) {
                valid = true;
                break;
            }
            // Special case: integer is also a number
            if ((t === 'integer' && actualType === 'number' && Number.isInteger(instance))
            || (t === 'number' && actualType === 'integer') ) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            this.addError(
                instancePath,
                schemaPath,
                'type',
                `must be ${Array.isArray(type) ? type.join(' or ') : type}`,
                { type: types, actualType },
                pExternalErr
            );
        }
    }

    /**
     * Validate const keyword
     */
    private validateConst(
        instance: any,
        constValue: any,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        if (!this.deepEqual(instance, constValue)) {
            this.addError(
                instancePath,
                schemaPath,
                'const',
                `must be equal to constant`,
                { allowedValue: constValue },
                pExternalErr
            );
        }
    }

    /**
     * Validate enum keyword
     */
    private validateEnum(
        instance: any,
        enumValues: any[],
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        let valid = false;
        for (const value of enumValues) {
            if (this.deepEqual(instance, value)) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            this.addError(
                instancePath,
                schemaPath,
                'enum',
                `must be equal to one of the allowed values`,
                { allowedValues: enumValues },
                pExternalErr
            );
        }
    }

    /**
     * Validate string-specific keywords
     */
    private validateString(
        instance: string,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        // minLength
        if (schema.minLength !== undefined && instance.length < schema.minLength) {
            this.addError(
                instancePath,
                `${schemaPath}/minLength`,
                'minLength',
                `must NOT have fewer than ${schema.minLength} characters`,
                { limit: schema.minLength },
                pExternalErr
            );
        }

        // maxLength
        if (schema.maxLength !== undefined && instance.length > schema.maxLength) {
            this.addError(
                instancePath,
                `${schemaPath}/maxLength`,
                'maxLength',
                `must NOT have more than ${schema.maxLength} characters`,
                { limit: schema.maxLength },
                pExternalErr
            );
        }

        // pattern
        if (schema.pattern) {
            const regex = new RegExp(schema.pattern);
            if (!regex.test(instance)) {
                this.addError(
                    instancePath,
                    `${schemaPath}/pattern`,
                    'pattern',
                    `must match pattern "${schema.pattern}"`,
                    { pattern: schema.pattern },
                    pExternalErr
                );
            }
        }

        // format (basic validation)
        if (schema.format) {
            this.validateFormat(instance, schema.format, instancePath, `${schemaPath}/format`,
                pExternalErr);
        }
    }

    /**
     * Validate numeric keywords
     */
    private validateNumeric(
        instance: number,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        // multipleOf
        if (schema.multipleOf !== undefined) {
            const division = instance / schema.multipleOf;
            if (!Number.isInteger(division)) {
                this.addError(
                    instancePath,
                    `${schemaPath}/multipleOf`,
                    'multipleOf',
                    `must be multiple of ${schema.multipleOf}`,
                    { multipleOf: schema.multipleOf },
                    pExternalErr
                );
            }
        }

        // minimum
        if (schema.minimum !== undefined && instance < schema.minimum) {
            this.addError(
                instancePath,
                `${schemaPath}/minimum`,
                'minimum',
                `must be >= ${schema.minimum}`,
                { comparison: '>=', limit: schema.minimum },
                pExternalErr
            );
        }

        // maximum
        if (schema.maximum !== undefined && instance > schema.maximum) {
            this.addError(
                instancePath,
                `${schemaPath}/maximum`,
                'maximum',
                `must be <= ${schema.maximum}`,
                { comparison: '<=', limit: schema.maximum },
                pExternalErr
            );
        }

        // exclusiveMinimum
        if (schema.exclusiveMinimum !== undefined && instance <= schema.exclusiveMinimum) {
            this.addError(
                instancePath,
                `${schemaPath}/exclusiveMinimum`,
                'exclusiveMinimum',
                `must be > ${schema.exclusiveMinimum}`,
                { comparison: '>', limit: schema.exclusiveMinimum },
                pExternalErr
            );
        }

        // exclusiveMaximum
        if (schema.exclusiveMaximum !== undefined && instance >= schema.exclusiveMaximum) {
            this.addError(
                instancePath,
                `${schemaPath}/exclusiveMaximum`,
                'exclusiveMaximum',
                `must be < ${schema.exclusiveMaximum}`,
                { comparison: '<', limit: schema.exclusiveMaximum },
                pExternalErr
            );
        }
    }

    /**
     * Validate array-specific keywords
     */
    private validateArray(
        instance: any[],
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        // minItems
        if (schema.minItems !== undefined && instance.length < schema.minItems) {
            this.addError(
                instancePath,
                `${schemaPath}/minItems`,
                'minItems',
                `must NOT have fewer than ${schema.minItems} items`,
                { limit: schema.minItems },
                pExternalErr
            );
        }

        // maxItems
        if (schema.maxItems !== undefined && instance.length > schema.maxItems) {
            this.addError(
                instancePath,
                `${schemaPath}/maxItems`,
                'maxItems',
                `must NOT have more than ${schema.maxItems} items`,
                { limit: schema.maxItems },
                pExternalErr
            );
        }

        // uniqueItems
        if (schema.uniqueItems === true) {
            for (let i = 0; i < instance.length; i++) {
                for (let j = i + 1; j < instance.length; j++) {
                    if (this.deepEqual(instance[i], instance[j])) {
                        this.addError(
                            `${instancePath}/${j}`,
                            `${schemaPath}/uniqueItems`,
                            'uniqueItems',
                            `must NOT have duplicate items (items ## ${i} and ${j} are identical)`,
                            null,
                            pExternalErr
                        );
                        break;
                    }
                }
            }
        }

        // prefixItems (Draft 2020-12)
        if (schema.prefixItems && Array.isArray(schema.prefixItems)) {
            for (let i = 0; i < schema.prefixItems.length && i < instance.length; i++) {
                this.validateSchema(
                    instance[i],
                    schema.prefixItems[i],
                    `${instancePath}/${i}`,
                    `${schemaPath}/prefixItems/${i}`,
                    pExternalErr
                );
            }
        }

        // items
        if (schema.items) {
            const startIndex = schema.prefixItems ? schema.prefixItems.length : 0;
            for (let i = startIndex; i < instance.length; i++) {
                this.validateSchema(
                    instance[i],
                    schema.items,
                    `${instancePath}/${i}`,
                    `${schemaPath}/items`,
                    pExternalErr
                );
            }
        }

        // contains
        if (schema.contains) {
            let matchCount = 0;
            for (let i = 0; i < instance.length; i++) {
                const prevErrorCount = this.errors.length;
                this.validateSchema(
                    instance[i],
                    schema.contains,
                    `${instancePath}/${i}`,
                    `${schemaPath}/contains`,
                    pExternalErr
                );
                if (this.errors.length === prevErrorCount) {
                    matchCount++;
                } else {
                    // Remove errors from failed contains check
                    this.errors.splice(prevErrorCount);
                }
            }

            const minContains = schema.minContains ?? 1;
            const maxContains = schema.maxContains ?? Infinity;

            if (matchCount < minContains) {
                this.addError(
                    instancePath,
                    `${schemaPath}/minContains`,
                    'minContains',
                    `must contain at least ${minContains} valid item(s)`,
                    { minContains },
                    pExternalErr
                );
            }

            if (matchCount > maxContains) {
                this.addError(
                    instancePath,
                    `${schemaPath}/maxContains`,
                    'maxContains',
                    `must contain at most ${maxContains} valid item(s)`,
                    { maxContains },
                    pExternalErr
                );
            }
        }
    }

    /**
     * Validate object-specific keywords
     */
    private validateObject(
        instance: Record<string, any>,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        const keys = Object.keys(instance);

        // minProperties
        if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
            this.addError(
                instancePath,
                `${schemaPath}/minProperties`,
                'minProperties',
                `must NOT have fewer than ${schema.minProperties} properties`,
                { limit: schema.minProperties },
                pExternalErr
            );
        }

        // maxProperties
        if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) {
            this.addError(
                instancePath,
                `${schemaPath}/maxProperties`,
                'maxProperties',
                `must NOT have more than ${schema.maxProperties} properties`,
                { limit: schema.maxProperties },
                pExternalErr
            );
        }

        // required
        if (schema.required) {
            for (const prop of schema.required) {
                if (!(prop in instance)) {
                    this.addError(
                        instancePath,
                        `${schemaPath}/required`,
                        'required',
                        `must have required property '${prop}'`,
                        { missingProperty: prop },
                        pExternalErr
                    );
                }
            }
        }

        // properties
        if (schema.properties) {
            for (const prop in schema.properties) {
                if (prop in instance) {
                    this.validateSchema(
                        instance[prop],
                        schema.properties[prop],
                        `${instancePath}/${prop}`,
                        `${schemaPath}/properties/${prop}`,
                        pExternalErr
                    );
                }
            }
        }

        // patternProperties
        if (schema.patternProperties) {
            for (const pattern in schema.patternProperties) {
                const regex = new RegExp(pattern);
                for (const prop of keys) {
                    if (regex.test(prop)) {
                        this.validateSchema(
                            instance[prop],
                            schema.patternProperties[pattern],
                            `${instancePath}/${prop}`,
                            `${schemaPath}/patternProperties/${pattern}`,
                            pExternalErr
                        );
                    }
                }
            }
        }

        // additionalProperties
        if (schema.additionalProperties !== undefined) {
            const validated = new Set<string>();

            if (schema.properties) {
                Object.keys(schema.properties).forEach(k => validated.add(k));
            }

            if (schema.patternProperties) {
                for (const pattern in schema.patternProperties) {
                    const regex = new RegExp(pattern);
                    keys.filter(k => regex.test(k)).forEach(k => validated.add(k));
                }
            }

            for (const prop of keys) {
                if (!validated.has(prop)) {
                    if (schema.additionalProperties === false) {
                        this.addError(
                            instancePath,
                            `${schemaPath}/additionalProperties`,
                            'additionalProperties',
                            `must NOT have additional properties`,
                            { additionalProperty: prop },
                            pExternalErr
                        );
                    } else if (typeof schema.additionalProperties === 'object') {
                        this.validateSchema(
                            instance[prop],
                            schema.additionalProperties,
                            `${instancePath}/${prop}`,
                            `${schemaPath}/additionalProperties`,
                            pExternalErr
                        );
                    }
                }
            }
        }

        // dependentRequired
        if (schema.dependentRequired) {
            for (const prop in schema.dependentRequired) {
                if (prop in instance) {
                    const required = schema.dependentRequired[prop];
                    for (const req of required) {
                        if (!(req in instance)) {
                            this.addError(
                                instancePath,
                                `${schemaPath}/dependentRequired`,
                                'dependentRequired',
                                `must have property '${req}' when property '${prop}' is present`,
                                { property: prop, missingProperty: req },
                                pExternalErr
                            );
                        }
                    }
                }
            }
        }

        // dependentSchemas
        if (schema.dependentSchemas) {
            for (const prop in schema.dependentSchemas) {
                if (prop in instance) {
                    this.validateSchema(
                        instance,
                        schema.dependentSchemas[prop],
                        instancePath,
                        `${schemaPath}/dependentSchemas/${prop}`,
                        pExternalErr
                    );
                }
            }
        }
    }

    /**
     * Validate logical operators
     */
    private validateLogicalOperators(
        instance: any,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        // allOf
        if (schema.allOf) {
            for (let i = 0; i < schema.allOf.length; i++) {
                this.validateSchema(
                    instance,
                    schema.allOf[i],
                    instancePath,
                    `${schemaPath}/allOf/${i}`
                );
            }
        }

        // anyOf
        if (schema.anyOf) {
            const ooerr:any[] = [];
            let valid = false;

            for (let i = 0; i < schema.anyOf.length; i++) {
                const beforeCount = ooerr.length;
                this.validateSchema(
                    instance,
                    schema.anyOf[i],
                    instancePath,
                    `${schemaPath}/anyOf/${i}`,
                    ooerr
                );
                if (ooerr.length === beforeCount) {
                    valid = true;
                    break;
                }
            }

            if (!valid) {
                this.addError(
                    instancePath,
                    `${schemaPath}/anyOf`,
                    'anyOf',
                    `must match at least one schema in anyOf`,
                    pExternalErr
                );
            }
        }

        // oneOf
        if (schema.oneOf) {
            let validCount = 0;
            const ooerr:any[] = [];

            for (let i = 0; i < schema.oneOf.length; i++) {
                const beforeCount = ooerr.length;
                this.validateSchema(
                    instance,
                    schema.oneOf[i],
                    instancePath,
                    `${schemaPath}/oneOf/${i}`,
                    ooerr
                );
                if (ooerr.length === beforeCount) {
                    validCount++;
                }
                //errorSnapshots.push(ooerr.length);
            }

            if (validCount !== 1) {
                this.addError(
                    instancePath,
                    `${schemaPath}/oneOf`,
                    'oneOf',
                    `must match exactly one schema in oneOf (matched ${validCount})`,
                    { passingSchemas: validCount },
                    pExternalErr
                );
            }
        }

        // not
        if (schema.not) {
            const beforeCount = this.errors.length;
            this.validateSchema(
                instance,
                schema.not,
                instancePath,
                `${schemaPath}/not`
            );
            if (this.errors.length === beforeCount) {
                this.addError(
                    instancePath,
                    `${schemaPath}/not`,
                    'not',
                    `must NOT be valid against the not schema`,
                    pExternalErr
                );
            } else {
                // Remove errors from not validation
                this.errors.splice(beforeCount);
            }
        }
    }

    /**
     * Validate conditional keywords (if/then/else)
     */
    private validateConditional(
        instance: any,
        schema: IJSONSchema,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        if (schema.if) {
            const beforeCount = this.errors.length;
            this.validateSchema(
                instance,
                schema.if,
                instancePath,
                `${schemaPath}/if`
            );
            const ifValid = this.errors.length === beforeCount;

            // Remove if validation errors
            this.errors.splice(beforeCount);

            if (ifValid && schema.then) {
                this.validateSchema(
                    instance,
                    schema.then,
                    instancePath,
                    `${schemaPath}/then`
                );
            } else if (!ifValid && schema.else) {
                this.validateSchema(
                    instance,
                    schema.else,
                    instancePath,
                    `${schemaPath}/else`
                );
            }
        }
    }

    /**
     * Validate format (basic implementation)
     */
    private validateFormat(
        instance: string,
        format: string,
        instancePath: string,
        schemaPath: string,
        pExternalErr:any[]|null = null
    ): void {
        let valid = true;
        let message = '';

        switch (format) {
            case 'email':
                valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instance);
                message = 'must be a valid email';
                break;
            case 'date-time':
                valid = !isNaN(Date.parse(instance));
                message = 'must be a valid date-time (RFC 3339)';
                break;
            case 'date':
                const m = instance.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if(m!=null){
                    valid = (parseInt(m[1],10)<=9999)
                                && (parseInt(m[2],10)>0 && parseInt(m[2],10)<=12)
                                && (parseInt(m[3],10)>0 && parseInt(m[3],10)<=31);
                }else valid = true;
                message = 'must be a valid date (YYYY-MM-DD)';
                break;
            case 'time':
                const t = instance.match(/^(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/);
                if(t!=null){
                    valid = (parseInt(t[1],10)<=23)
                        && (parseInt(t[2],10)<=59)
                        && (parseInt(t[3],10)<=59);
                }else valid = true;
                message = 'must be a valid time (HH:MM:SS)';
                break;
            case 'uri':
            case 'uri-reference':
                try {
                    new URL(instance);
                    valid = true;
                } catch {
                    valid = false;
                }
                message = 'must be a valid URI';
                break;
            case 'uuid':
                valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(instance);
                message = 'must be a valid UUID';
                break;
            case 'ipv4':
                valid = /^(\d{1,3}\.){3}\d{1,3}$/.test(instance);
                message = 'must be a valid IPv4 address';
                break;
            case 'ipv6':
                valid = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(instance);
                message = 'must be a valid IPv6 address';
                break;
        }

        if (!valid) {
            this.addError(
                instancePath,
                schemaPath,
                'format',
                message,
                { format },
                pExternalErr
            );
        }
    }

    /**
     * Resolve $ref
     */
    private resolveRef(ref: string, schema: IJSONSchema): IJSONSchema | null {
        if (ref.startsWith('#')) {
            // Internal reference
            return this.resolveInternalRef(ref, schema);
        } else {
            // External reference
            const uri = ref.split('#')[0];
            const fragment = ref.split('#')[1];
            const externalSchema = this.schemas.get(uri);
            if (externalSchema) {
                if (fragment) {
                    return this.resolveInternalRef(`#${fragment}`, externalSchema);
                }
                return externalSchema;
            }
        }
        return null;
    }

    /**
     * Resolve internal $ref (JSON Pointer)
     */
    private resolveInternalRef(ref: string, rootSchema: IJSONSchema): IJSONSchema | null {
        if (ref === '#') return rootSchema;

        if(this.schemas.get(ref)!=null) return this.schemas.get(ref);

        const path = ref.substring(2).split('/');


        let current: any = rootSchema;


        for (const segment of path) {
            const decoded = segment.replace(/~1/g, '/').replace(/~0/g, '~');
            if (current && typeof current === 'object' && decoded in current) {
                current = current[decoded];
            } else {
                return null;
            }
        }

        return current as IJSONSchema;
    }

    /**
     * Get JSON type of a value
     */
    private getType(value: any): JSONSchemaType {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'integer' : 'number';
        }
        if (typeof value === 'string') return 'string';
        if (typeof value === 'object') return 'object';
        return 'null';
    }

    /**
     * Deep equality check
     */
    private deepEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }

        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Add validation error
     */
    private addError(
        instancePath: string,
        schemaPath: string,
        keyword: string,
        message: string,
        params?: any,
        pExternalErr:any[]|null = null
    ): void {
        (pExternalErr===null ? this.errors : pExternalErr).push({
            instancePath,
            schemaPath,
            keyword,
            message,
            params
        });
    }

    /**
     * Get validation result
     */
    private getResult(): ValidationResult {
        return {
            valid: this.errors.length === 0,
            errors: this.errors
        };
    }
}

/**
 * Quick validation helper function
 *
 * @param {any} instance - The instance to validate
 * @param {JSONSchema} schema - The JSON Schema
 * @return {ValidationResult} The validation result
 */
export function validateJSONSchema(instance: any, schema: JSONSchema): ValidationResult {
    const validator = new JSONSchemaValidator();
    return validator.validate(instance, schema);
}
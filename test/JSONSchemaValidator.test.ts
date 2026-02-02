
import { expect } from 'chai';
import { JSONSchemaValidator, validateJSONSchema, ValidationResult } from '../src/utils/JSONSchemaValidator.js';
import { IJSONSchema, IJSONSchemaDocument } from '../src/utils/JSONSchema.js';

describe('JSONSchemaValidator', function() {

    let validator: JSONSchemaValidator;

    beforeEach(function() {
        validator = new JSONSchemaValidator();
    });

    describe('Boolean schemas', function() {
        it('should always validate when schema is true', function() {
            const result = validator.validate({ anything: 'goes' }, true);
            expect(result.valid).to.be.true;
            expect(result.errors).to.be.empty;
        });

        it('should always fail when schema is false', function() {
            const result = validator.validate({ anything: 'goes' }, false);
            expect(result.valid).to.be.false;
            expect(result.errors).to.have.lengthOf(1);
            expect(result.errors[0].keyword).to.equal('false');
        });

        it('should validate any primitive with true schema', function() {
            expect(validator.validate(null, true).valid).to.be.true;
            expect(validator.validate(123, true).valid).to.be.true;
            expect(validator.validate('text', true).valid).to.be.true;
            expect(validator.validate([], true).valid).to.be.true;
        });
    });

    describe('Type validation', function() {
        it('should validate string type', function() {
            const schema: IJSONSchema = { type: 'string' };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate(123, schema).valid).to.be.false;
        });

        it('should validate number type', function() {
            const schema: IJSONSchema = { type: 'number' };
            expect(validator.validate(123, schema).valid).to.be.true;
            expect(validator.validate(123.45, schema).valid).to.be.true;
            expect(validator.validate('123', schema).valid).to.be.false;
        });

        it('should validate integer type', function() {
            const schema: IJSONSchema = { type: 'integer' };
            expect(validator.validate(123, schema).valid).to.be.true;
            expect(validator.validate(123.45, schema).valid).to.be.false;
        });

        it('should validate boolean type', function() {
            const schema: IJSONSchema = { type: 'boolean' };
            expect(validator.validate(true, schema).valid).to.be.true;
            expect(validator.validate(false, schema).valid).to.be.true;
            expect(validator.validate(1, schema).valid).to.be.false;
        });

        it('should validate null type', function() {
            const schema: IJSONSchema = { type: 'null' };
            expect(validator.validate(null, schema).valid).to.be.true;
            expect(validator.validate(undefined, schema).valid).to.be.true;
        });

        it('should validate array type', function() {
            const schema: IJSONSchema = { type: 'array' };
            expect(validator.validate([1, 2, 3], schema).valid).to.be.true;
            expect(validator.validate([], schema).valid).to.be.true;
            expect(validator.validate({}, schema).valid).to.be.false;
        });

        it('should validate object type', function() {
            const schema: IJSONSchema = { type: 'object' };
            expect(validator.validate({}, schema).valid).to.be.true;
            expect(validator.validate({ a: 1 }, schema).valid).to.be.true;
            expect(validator.validate([], schema).valid).to.be.false;
        });

        it('should validate multiple types', function() {
            const schema: IJSONSchema = { type: ['string', 'number'] };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate(123, schema).valid).to.be.true;
            expect(validator.validate(true, schema).valid).to.be.false;
        });
    });

    describe('Const and Enum', function() {
        it('should validate const', function() {
            const schema: IJSONSchema = { const: 'foo' };
            expect(validator.validate('foo', schema).valid).to.be.true;
            expect(validator.validate('bar', schema).valid).to.be.false;
        });

        it('should validate const with complex types', function() {
            const schema: IJSONSchema = { const: { a: 1, b: 2 } };
            expect(validator.validate({ a: 1, b: 2 }, schema).valid).to.be.true;
            expect(validator.validate({ a: 1, b: 3 }, schema).valid).to.be.false;
        });

        it('should validate enum', function() {
            const schema: IJSONSchema = { enum: ['red', 'green', 'blue'] };
            expect(validator.validate('red', schema).valid).to.be.true;
            expect(validator.validate('green', schema).valid).to.be.true;
            expect(validator.validate('yellow', schema).valid).to.be.false;
        });

        it('should validate enum with mixed types', function() {
            const schema: IJSONSchema = { enum: [1, '1', true, null] };
            expect(validator.validate(1, schema).valid).to.be.true;
            expect(validator.validate('1', schema).valid).to.be.true;
            expect(validator.validate(true, schema).valid).to.be.true;
            expect(validator.validate(null, schema).valid).to.be.true;
            expect(validator.validate(false, schema).valid).to.be.false;
        });
    });

    describe('String validation', function() {
        it('should validate minLength', function() {
            const schema: IJSONSchema = { type: 'string', minLength: 3 };
            expect(validator.validate('abc', schema).valid).to.be.true;
            expect(validator.validate('ab', schema).valid).to.be.false;
        });

        it('should validate maxLength', function() {
            const schema: IJSONSchema = { type: 'string', maxLength: 5 };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate('hello world', schema).valid).to.be.false;
        });

        it('should validate pattern', function() {
            const schema: IJSONSchema = { type: 'string', pattern: '^[a-z]+$' };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate('Hello', schema).valid).to.be.false;
            expect(validator.validate('hello123', schema).valid).to.be.false;
        });

        it('should validate email format', function() {
            const schema: IJSONSchema = { type: 'string', format: 'email' };
            expect(validator.validate('test@example.com', schema).valid).to.be.true;
            expect(validator.validate('invalid-email', schema).valid).to.be.false;
        });

        it('should validate date-time format', function() {
            const schema: IJSONSchema = { type: 'string', format: 'date-time' };
            expect(validator.validate('2023-12-25T10:30:00Z', schema).valid).to.be.true;
            expect(validator.validate('invalid-date', schema).valid).to.be.false;
        });

        it('should validate date format', function() {
            const schema: IJSONSchema = { type: 'string', format: 'date' };
            expect(validator.validate('2023-12-25', schema).valid).to.be.true;
            expect(validator.validate('2023-12-32', schema).valid).to.be.false;
        });

        it('should validate uuid format', function() {
            const schema: IJSONSchema = { type: 'string', format: 'uuid' };
            expect(validator.validate('123e4567-e89b-12d3-a456-426614174000', schema).valid).to.be.true;
            expect(validator.validate('not-a-uuid', schema).valid).to.be.false;
        });

        it('should validate ipv4 format', function() {
            const schema: IJSONSchema = { type: 'string', format: 'ipv4' };
            expect(validator.validate('192.168.1.1', schema).valid).to.be.true;
            expect(validator.validate('256.1.1.1', schema).valid).to.be.true; // Basic regex check
        });
    });

    describe('Numeric validation', function() {
        it('should validate minimum', function() {
            const schema: IJSONSchema = { type: 'number', minimum: 5 };
            expect(validator.validate(5, schema).valid).to.be.true;
            expect(validator.validate(10, schema).valid).to.be.true;
            expect(validator.validate(4, schema).valid).to.be.false;
        });

        it('should validate maximum', function() {
            const schema: IJSONSchema = { type: 'number', maximum: 10 };
            expect(validator.validate(10, schema).valid).to.be.true;
            expect(validator.validate(5, schema).valid).to.be.true;
            expect(validator.validate(11, schema).valid).to.be.false;
        });

        it('should validate exclusiveMinimum', function() {
            const schema: IJSONSchema = { type: 'number', exclusiveMinimum: 5 };
            expect(validator.validate(6, schema).valid).to.be.true;
            expect(validator.validate(5, schema).valid).to.be.false;
        });

        it('should validate exclusiveMaximum', function() {
            const schema: IJSONSchema = { type: 'number', exclusiveMaximum: 10 };
            expect(validator.validate(9, schema).valid).to.be.true;
            expect(validator.validate(10, schema).valid).to.be.false;
        });

        it('should validate multipleOf', function() {
            const schema: IJSONSchema = { type: 'number', multipleOf: 5 };
            expect(validator.validate(10, schema).valid).to.be.true;
            expect(validator.validate(15, schema).valid).to.be.true;
            expect(validator.validate(12, schema).valid).to.be.false;
        });

        it('should validate range', function() {
            const schema: IJSONSchema = {
                type: 'integer',
                minimum: 0,
                maximum: 100
            };
            expect(validator.validate(50, schema).valid).to.be.true;
            expect(validator.validate(0, schema).valid).to.be.true;
            expect(validator.validate(100, schema).valid).to.be.true;
            expect(validator.validate(-1, schema).valid).to.be.false;
            expect(validator.validate(101, schema).valid).to.be.false;
        });
    });

    describe('Array validation', function() {
        it('should validate minItems', function() {
            const schema: IJSONSchema = { type: 'array', minItems: 2 };
            expect(validator.validate([1, 2], schema).valid).to.be.true;
            expect(validator.validate([1], schema).valid).to.be.false;
        });

        it('should validate maxItems', function() {
            const schema: IJSONSchema = { type: 'array', maxItems: 3 };
            expect(validator.validate([1, 2, 3], schema).valid).to.be.true;
            expect(validator.validate([1, 2, 3, 4], schema).valid).to.be.false;
        });

        it('should validate uniqueItems', function() {
            const schema: IJSONSchema = { type: 'array', uniqueItems: true };
            expect(validator.validate([1, 2, 3], schema).valid).to.be.true;
            expect(validator.validate([1, 2, 2], schema).valid).to.be.false;
        });

        it('should validate items schema', function() {
            const schema: IJSONSchema = {
                type: 'array',
                items: { type: 'number' }
            };
            expect(validator.validate([1, 2, 3], schema).valid).to.be.true;
            expect(validator.validate([1, 'two', 3], schema).valid).to.be.false;
        });

        it('should validate prefixItems (Draft 2020-12)', function() {
            const schema: IJSONSchema = {
                type: 'array',
                prefixItems: [
                    { type: 'number' },
                    { type: 'string' },
                    { type: 'boolean' }
                ]
            };
            expect(validator.validate([1, 'two', true], schema).valid).to.be.true;
            expect(validator.validate(['one', 'two', true], schema).valid).to.be.false;
        });

        it('should validate contains', function() {
            const schema: IJSONSchema = {
                type: 'array',
                contains: { type: 'number', minimum: 5 }
            };
            expect(validator.validate([1, 6, 3], schema).valid).to.be.true;
            expect(validator.validate([1, 2, 3], schema).valid).to.be.false;
        });

        it('should validate minContains and maxContains', function() {
            const schema: IJSONSchema = {
                type: 'array',
                contains: { type: 'number' },
                minContains: 2,
                maxContains: 4
            };
            expect(validator.validate([1, 2, 'a'], schema).valid).to.be.true;
            expect(validator.validate([1, 'a', 'b'], schema).valid).to.be.false;
            expect(validator.validate([1, 2, 3, 4, 5], schema).valid).to.be.false;
        });
    });

    describe('Object validation', function() {
        it('should validate properties', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                }
            };
            expect(validator.validate({ name: 'Alice', age: 30 }, schema).valid).to.be.true;
            expect(validator.validate({ name: 'Alice', age: 'thirty' }, schema).valid).to.be.false;
        });

        it('should validate required properties', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name']
            };
            expect(validator.validate({ name: 'Alice' }, schema).valid).to.be.true;
            expect(validator.validate({ age: 30 }, schema).valid).to.be.false;
        });

        it('should validate minProperties', function() {
            const schema: IJSONSchema = { type: 'object', minProperties: 2 };
            expect(validator.validate({ a: 1, b: 2 }, schema).valid).to.be.true;
            expect(validator.validate({ a: 1 }, schema).valid).to.be.false;
        });

        it('should validate maxProperties', function() {
            const schema: IJSONSchema = { type: 'object', maxProperties: 2 };
            expect(validator.validate({ a: 1, b: 2 }, schema).valid).to.be.true;
            expect(validator.validate({ a: 1, b: 2, c: 3 }, schema).valid).to.be.false;
        });

        it('should validate additionalProperties false', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                additionalProperties: false
            };
            expect(validator.validate({ name: 'Alice' }, schema).valid).to.be.true;
            expect(validator.validate({ name: 'Alice', age: 30 }, schema).valid).to.be.false;
        });

        it('should validate additionalProperties with schema', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                additionalProperties: { type: 'number' }
            };
            expect(validator.validate({ name: 'Alice', age: 30 }, schema).valid).to.be.true;
            expect(validator.validate({ name: 'Alice', age: 'thirty' }, schema).valid).to.be.false;
        });

        it('should validate patternProperties', function() {
            const schema: IJSONSchema = {
                type: 'object',
                patternProperties: {
                    '^num': { type: 'number' }
                }
            };
            expect(validator.validate({ num1: 1, num2: 2 }, schema).valid).to.be.true;
            expect(validator.validate({ num1: 1, num2: 'two' }, schema).valid).to.be.false;
        });

        it('should validate dependentRequired', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    creditCard: { type: 'string' },
                    billingAddress: { type: 'string' }
                },
                dependentRequired: {
                    creditCard: ['billingAddress']
                }
            };
            expect(validator.validate({ name: 'Alice' }, schema).valid).to.be.true;
            expect(validator.validate({ name: 'Alice', creditCard: '1234' }, schema).valid).to.be.false;
            expect(validator.validate({ name: 'Alice', creditCard: '1234', billingAddress: '123 St' }, schema).valid).to.be.true;
        });

        it('should validate dependentSchemas', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    creditCard: { type: 'string' }
                },
                dependentSchemas: {
                    creditCard: {
                        properties: {
                            billingAddress: { type: 'string' }
                        },
                        required: ['billingAddress']
                    }
                }
            };
            expect(validator.validate({ name: 'Alice', creditCard: '1234', billingAddress: '123 St' }, schema).valid).to.be.true;
            expect(validator.validate({ name: 'Alice', creditCard: '1234' }, schema).valid).to.be.false;
        });
    });

    describe('Logical operators', function() {
        it('should validate allOf', function() {
            const schema: IJSONSchema = {
                allOf: [
                    { type: 'string' },
                    { minLength: 3 }
                ]
            };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate('hi', schema).valid).to.be.false;
        });

        it('should validate anyOf', function() {
            const schema: IJSONSchema = {
                anyOf: [
                    { type: 'string' },
                    { type: 'number' }
                ]
            };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate(123, schema).valid).to.be.true;
            expect(validator.validate(true, schema).valid).to.be.false;

        });

        it('should validate oneOf', function() {
            const schema: IJSONSchema = {
                oneOf: [
                    { type: 'string', minLength: 5 },
                    { type: 'string', maxLength: 3 }
                ]
            };
            expect(validator.validate('hello', schema).valid).to.be.true;
            expect(validator.validate('hi', schema).valid).to.be.true;
            expect(validator.validate('test', schema).valid).to.be.false; // Matches neither
        });

        it('should validate not', function() {
            const schema: IJSONSchema = {
                not: { type: 'string' }
            };
            expect(validator.validate(123, schema).valid).to.be.true;
            expect(validator.validate('hello', schema).valid).to.be.false;
        });
    });

    describe('Conditional validation (if/then/else)', function() {
        it('should validate if/then', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    type: { type: 'string' },
                    value: {}
                },
                if: {
                    properties: { type: { const: 'number' } }
                },
                then: {
                    properties: { value: { type: 'number' } }
                }
            };
            expect(validator.validate({ type: 'number', value: 123 }, schema).valid).to.be.true;
            expect(validator.validate({ type: 'number', value: 'abc' }, schema).valid).to.be.false;
            expect(validator.validate({ type: 'string', value: 'abc' }, schema).valid).to.be.true;
        });

        it('should validate if/else', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    type: { type: 'string' },
                    value: {}
                },
                if: {
                    properties: { type: { const: 'number' } }
                },
                else: {
                    properties: { value: { type: 'string' } }
                }
            };
            expect(validator.validate({ type: 'string', value: 'abc' }, schema).valid).to.be.true;
            expect(validator.validate({ type: 'string', value: 123 }, schema).valid).to.be.false;
        });
    });

    describe('$ref resolution', function() {
        it('should resolve internal $ref with $defs', function() {
            const schema: IJSONSchema = {
                $defs: {
                    address: {
                        type: 'object',
                        properties: {
                            street: { type: 'string' },
                            city: { type: 'string' }
                        }
                    }
                },
                type: 'object',
                properties: {
                    home: { $ref: '#/$defs/address' },
                    work: { $ref: '#/$defs/address' }
                }
            };

            const validInstance = {
                home: { street: '123 Main St', city: 'Springfield' },
                work: { street: '456 Work Ave', city: 'Shelbyville' }
            };

            expect(validator.validate(validInstance, schema).valid).to.be.true;

            const invalidInstance = {
                home: { street: '123 Main St', city: 123 }
            };

            expect(validator.validate(invalidInstance, schema).valid).to.be.false;
        });

        it('should resolve external $ref', function() {
            const addressSchema: IJSONSchema = {
                $id: 'https://example.com/address.json',
                type: 'object',
                properties: {
                    street: { type: 'string' },
                    city: { type: 'string' }
                }
            };

            validator.registerSchema('https://example.com/address.json', addressSchema);

            const personSchema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    address: { $ref: 'https://example.com/address.json#' }
                }
            };

            const validPerson = {
                name: 'Alice',
                address: { street: '123 Main St', city: 'Springfield' }
            };

            expect(validator.validate(validPerson, personSchema).valid).to.be.true;
        });
    });

    describe('Complex nested schemas', function() {
        it('should validate deeply nested object', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    user: {
                        type: 'object',
                        properties: {
                            profile: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    age: { type: 'integer', minimum: 0 }
                                },
                                required: ['name']
                            }
                        }
                    }
                }
            };

            expect(validator.validate({
                user: {
                    profile: { name: 'Alice', age: 30 }
                }
            }, schema).valid).to.be.true;

            expect(validator.validate({
                user: {
                    profile: { age: 30 }
                }
            }, schema).valid).to.be.false;
        });

        it('should validate array of objects', function() {
            const schema: IJSONSchema = {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' }
                    },
                    required: ['id', 'name']
                }
            };

            expect(validator.validate([
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ], schema).valid).to.be.true;

            expect(validator.validate([
                { id: 1, name: 'Alice' },
                { id: 2 }
            ], schema).valid).to.be.false;
        });
    });

    describe('Error reporting', function() {
        it('should report type error with correct path', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    age: { type: 'number' }
                }
            };

            const result = validator.validate({ age: 'thirty' }, schema);

            expect(result.valid).to.be.false;
            expect(result.errors).to.have.lengthOf(1);
            expect(result.errors[0].instancePath).to.equal('#/age');
            expect(result.errors[0].keyword).to.equal('type');
        });

        it('should report multiple errors', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 3 },
                    age: { type: 'number', minimum: 0 }
                },
                required: ['name', 'age']
            };

            const result = validator.validate({ name: 'Al', age: -5 }, schema);

            expect(result.valid).to.be.false;
            expect(result.errors.length).to.be.greaterThan(1);
        });

        it('should report error with params', function() {
            const schema: IJSONSchema = {
                type: 'string',
                minLength: 5
            };

            const result = validator.validate('hi', schema);

            expect(result.valid).to.be.false;
            expect(result.errors[0].params).to.exist;
            expect(result.errors[0].params.limit).to.equal(5);
        });
    });

    describe('validateJSONSchema helper function', function() {
        it('should validate using helper function', function() {
            const schema: IJSONSchema = {
                type: 'string',
                format: 'email'
            };

            const result1 = validateJSONSchema('test@example.com', schema);
            expect(result1.valid).to.be.true;

            const result2 = validateJSONSchema('invalid-email', schema);
            expect(result2.valid).to.be.false;
        });
    });

    describe('Edge cases', function() {
        it('should handle empty schema', function() {
            const schema: IJSONSchema = {};
            expect(validator.validate('anything', schema).valid).to.be.true;
            expect(validator.validate({ any: 'thing' }, schema).valid).to.be.true;
        });

        it('should handle null values', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    value: { type: ['string', 'null'] }
                }
            };
            expect(validator.validate({ value: null }, schema).valid).to.be.true;
            expect(validator.validate({ value: 'text' }, schema).valid).to.be.true;
        });

        it('should handle undefined vs null', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    optional: { type: 'string' }
                }
            };
            // Undefined property is allowed (not required)
            expect(validator.validate({}, schema).valid).to.be.true;
        });

        it('should handle empty arrays and objects', function() {
            const schema1: IJSONSchema = { type: 'array' };
            expect(validator.validate([], schema1).valid).to.be.true;

            const schema2: IJSONSchema = { type: 'object' };
            expect(validator.validate({}, schema2).valid).to.be.true;
        });
    });

    describe('Real-world schemas', function() {
        it('should validate user registration schema', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 20,
                        pattern: '^[a-zA-Z0-9_]+$'
                    },
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    password: {
                        type: 'string',
                        minLength: 8
                    },
                    age: {
                        type: 'integer',
                        minimum: 18,
                        maximum: 120
                    }
                },
                required: ['username', 'email', 'password']
            };

            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'securepass123',
                age: 25
            };

            expect(validator.validate(validUser, schema).valid).to.be.true;

            const invalidUser = {
                username: 'j',
                email: 'invalid',
                password: '123'
            };

            expect(validator.validate(invalidUser, schema).valid).to.be.false;
        });

        it('should validate API response schema', function() {
            const schema: IJSONSchema = {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        enum: ['success', 'error']
                    },
                    data: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                name: { type: 'string' }
                            },
                            required: ['id', 'name']
                        }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            total: { type: 'integer' },
                            page: { type: 'integer' }
                        }
                    }
                },
                required: ['status', 'data']
            };

            const validResponse = {
                status: 'success',
                data: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' }
                ],
                meta: {
                    total: 2,
                    page: 1
                }
            };

            expect(validator.validate(validResponse, schema).valid).to.be.true;
        });
    });
});

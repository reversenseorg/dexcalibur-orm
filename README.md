# @reversense/dexcalibur-orm

A TypeScript-based ORM (Object-Relational Mapping) library for the Reversense platform, designed to support reverse engineering and analysis of software, including mobile apps and firmware.

## Overview

Dexcalibur ORM provides a flexible and extensible database abstraction layer with support for:

- **Multiple data sources** via pluggable connectors
- **Type-safe node system** with built-in validation
- **JSON Schema validation** (Draft 2020-12)
- **Tagging and categorization** for organizing data
- **Security-focused validation** with sanitized values
- **Event-driven architecture** for database operations

## Features

### Core Components

- **Data Source Abstraction** - Connect to various data backends through a unified interface
- **Node System** - Strongly-typed node definitions with internal type checking
- **Validation Framework** - Comprehensive input validation with custom rules and JSON Schema support
- **Tag System** - Organize and categorize data with tags and tag categories
- **Security Layer** - Sanitized value handling to prevent unsafe data usage
- **Logging** - Flexible logging system with test and production modes

### Data Source Features

- Connector factory pattern for managing multiple data sources
- Built-in support for in-memory databases (for testing)
- Event system for tracking database operations
- Helper utilities for common data source operations

### Validation

- Custom validation rules with multiple strategies (equality, regex, custom functions)
- Pre-built validators for common types (UUID, email, Base64, etc.)
- JSON Schema validation with full Draft 2020-12 support
- Structured data validation with nested object support

## Installation

```bash
npm install @reversense/dexcalibur-orm
```
```


## Usage

### Basic Node Type Definition

```typescript
import { NodeType, ENodeInternalTypes } from '@reversense/dexcalibur-orm';

const MyNodeType = new NodeType(
  'my_custom_node',
  ENodeInternalTypes.CUSTOM,
  []
);
```


### Using the Validator

```typescript
import { ValidationRule, Validator } from '@reversense/dexcalibur-orm';

// Create validation rules
const validator = new Validator({
  email: [ValidationRule.email()],
  uuid: [ValidationRule.uuid()],
  customField: [ValidationRule.newRegexpAssert(/^[A-Z]{3}$/)]
});

// Validate data
const isValid = validator.validate('email', 'user@example.com');
console.log(isValid); // true
```


### JSON Schema Validation

```typescript
import { JSONSchemaValidator } from '@reversense/dexcalibur-orm';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 }
  },
  required: ['name']
};

const validator = new JSONSchemaValidator();
const result = validator.validate({ name: 'John', age: 30 }, schema);
console.log(result.valid); // true
```


### Working with Tags

```typescript
import { Tag, TagCategory } from '@reversense/dexcalibur-orm';

const category = new TagCategory({
  name: 'security',
  descr: 'Security-related tags'
});

const tag = new Tag({
  name: 'vulnerability',
  descr: 'Security vulnerability marker'
});

category.addTag(tag);
```


### Using Data Sources

```typescript
import { ConnectorFactory, DataSource } from '@reversense/dexcalibur-orm';

// Register a connector
ConnectorFactory.getInstance().register('mydb', MyDatabaseConnector);

// Create a data source
const dataSource = new DataSource({
  name: 'main_db',
  type: 'mydb',
  config: { /* connector-specific config */ }
});
```


## Development

### Building

```shell script
npm run build
```


### Testing

```shell script
npm test
```


## Project Structure

```
src/
├── core/              # Core utilities and interfaces
├── error/             # Custom error classes
├── search/            # Tag and search functionality
├── security/          # Security and validation
├── utils/             # Utility functions and helpers
└── *.ts              # Main ORM components
```


## Key Classes and Interfaces

### Validation

- `Validator` - Main validation class for field validation
- `ValidationRule` - Defines validation rules with multiple strategies
- `JSONSchemaValidator` - JSON Schema Draft 2020-12 validator

### Data Management

- `DataSource` - Represents a data source connection
- `ConnectorFactory` - Factory for creating database connectors
- `NodeType` - Defines custom node types
- `NodeProperty` - Defines node properties with validation

### Security

- `SanitizedValue` - Wrapper for sanitized input values
- `UnsafeValue` - Marker for potentially unsafe values
- `RuntimeSecurityException` - Security-related exceptions

### Utilities

- `Logger` - Flexible logging system
- `Utils` - Helper functions for object traversal and search
- `JSONSchema` - TypeScript type definitions for JSON Schema

## License

Copyright (C) 2026 Reversense SAS

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## Contributing

This library is part of the Reversense platform. For contribution guidelines, please refer to the main project documentation.

## Support

For issues and questions, please contact us or file an issue in the project repository.

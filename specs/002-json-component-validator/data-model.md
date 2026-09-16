# Data Model: JSON Component Validator

This document defines the key entities, their attributes, and relationships used by the JSON Component Validator.

## Key Entities & Type Definitions

### 1. ComponentValidationRequest
Represents the incoming payload sent to the REST API validation endpoint.

| Field Name | Type | Description | Required | Validation / Constraint |
|---|---|---|---|---|
| `componentPayload` | `string` \| `object` | The JSON content of the component instance to validate. | Yes | Must be a valid JSON object or parsable JSON string. |
| `componentType` | `string` | The unique name/identifier of the component (e.g., `quiz`, `medication`). | Yes | Must match an existing schema filename in the folder (e.g., `quiz` -> `quiz.schema.json`). |
| `correlationId` | `string` | A unique identifier for traceability and logging across systems. | No | If absent, the API will generate a unique UUID v4. |

```typescript
export interface ComponentValidationRequest {
  componentPayload: string | Record<string, any>;
  componentType: string;
  correlationId?: string;
}
```

---

### 2. ComponentValidationResponse
Represents the outcome returned by the REST API validation endpoint.

| Field Name | Type | Description | Required |
|---|---|---|---|
| `isValid` | `boolean` | Indicates whether the component is perfectly compliant with both the schema and the baseline template. | Yes |
| `correlationId` | `string` | The Correlation ID associated with this validation request (for traceability). | Yes |
| `errors` | `ComponentValidationError[]` | A list of validation errors detected. | Yes |
| `timestamp` | `string` | ISO 8601 timestamp representing when the validation was executed. | Yes |

```typescript
export interface ComponentValidationResponse {
  isValid: boolean;
  correlationId: string;
  errors: ComponentValidationError[];
  timestamp: string;
}
```

---

### 3. ComponentValidationError
Represents a single validation error (either from schema validation or baseline template mismatch).

| Field Name | Type | Description | Required | Example |
|---|---|---|---|---|
| `path` | `string` | The JSON Path pointing to the violating property. | Yes | `$.parameters.dosage` |
| `code` | `string` | A machine-readable error code. | Yes | `PREFILLED_FIELD_MISMATCH` |
| `message` | `string` | A descriptive, developer-friendly explanation of why validation failed. | Yes | `The field 'formatVersion' must be exactly '1.0.0'.` |

```typescript
export interface ComponentValidationError {
  path: string;
  code: 'MISSING_REQUIRED_PARAMETER' | 'INVALID_PARAMETER_TYPE' | 'PREFILLED_FIELD_MISMATCH' | 'SYNTAX_ERROR' | 'SCHEMA_NOT_FOUND' | 'SCHEMA_CORRUPTED';
  message: string;
}
```

---

### 4. ComponentSchema
Represents a schema stored in the local file system.

| Field Name | Type | Description | Required |
|---|---|---|---|
| `componentType` | `string` | The identifier derived from the schema's filename. | Yes |
| `schemaContent` | `object` | The parsed JSON Schema Draft-07 compliant object structure. | Yes |

---

### 5. ComponentTemplate
Represents the baseline template JSON file containing pre-filled/fixed fields.

| Field Name | Type | Description | Required |
|---|---|---|---|
| `componentType` | `string` | The identifier derived from the template's filename. | Yes |
| `templateContent` | `object` | The parsed JSON object representing the expected baseline structural boilerplate. | Yes |

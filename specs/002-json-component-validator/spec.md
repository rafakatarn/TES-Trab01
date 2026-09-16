# Feature Specification: JSON Component Validator

**Feature Branch**: `002-json-component-validator`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "O sistema deverá verificar os componentes em formato JSON e validar os campos conforme os schemas. Deverá ter os mesmos campos já preenchidos do schema e validadar os parâmetros também. Alguns parâmetros são obrigatórios e deverão estar presentes nos componentes. Os não obrigatórios tem presença opcional. Os schemas estarão disponíveis em uma pasta no sistema."

## Clarifications

### Session 2026-09-16

- Q: What is the primary interface and delivery mechanism of the validation system? (FR-010) → A: REST API (A web service exposing validation endpoints and handling JSON payloads over HTTP).
- Q: How should the validation system identify and enforce "pre-filled fields" from the schema? (FR-005) → A: Baseline JSON Template File (The validator compares the component against a separate JSON skeleton file that contains pre-filled values).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Component Parameters Against Schemas (Priority: P1)

As a system integrator, I want to submit a JSON component to the validator so that the system verifies if all required parameters are present and all provided parameters comply with their schema-defined rules (types, formats, ranges).

**Why this priority**: This is the core validation capability. It ensures component integrity and correctness, acting as the primary gatekeeper for data entry.

**Independent Test**: Can be fully tested by submitting a component JSON payload and its corresponding schema to the validation engine. If all required parameters exist with correct types, the validation should succeed with `isValid: true`.

**Acceptance Scenarios**:

1. **Given** a schema where `id` (string) and `status` (string) are required, and `description` (string) is optional, **When** a component containing `id` and `status` is validated, **Then** the validation succeeds with `isValid` set to `true` and 0 errors.
2. **Given** the same schema, **When** a component containing `id`, `status`, and `description` is validated, **Then** the validation succeeds with `isValid` set to `true` and 0 errors.
3. **Given** the same schema, **When** a component missing the required `id` field is validated, **Then** the validation fails with `isValid` set to `false` and an error indicating that the required parameter `id` is missing.
4. **Given** the same schema, **When** a component is validated where `id` is an integer instead of a string, **Then** the validation fails with `isValid` set to `false` and an error indicating an incorrect parameter type.

---

### User Story 2 - Match Pre-filled/Static Schema Fields (Priority: P2)

As a template consumer, I want my JSON components to contain the exact same pre-filled static/metadata fields (such as system type or fixed format version) defined in a baseline JSON template/skeleton file, so that the components adhere to the required structural boilerplate.

**Why this priority**: Enforces structural uniformity across components. It guarantees that any metadata or constant fields defined in a baseline template are correctly populated in the component instance, preventing missing or corrupted boilerplate information.

**Independent Test**: Can be fully tested by submitting a component with modified, missing, or incorrect pre-filled/static fields compared to the baseline template and verifying that the validator flags these fields as invalid.

**Acceptance Scenarios**:

1. **Given** a baseline JSON template that defines pre-filled/constant fields `formatVersion: "1.0.0"` and `category: "clinical-device"` alongside the schema, **When** a component with these exact pre-filled values is validated, **Then** the validation succeeds with `isValid` set to `true` and 0 errors.
2. **Given** the same baseline template, **When** a component with `formatVersion: "2.0.0"` is validated, **Then** the validation fails with `isValid` set to `false` and a structural mismatch error for `formatVersion`.
3. **Given** the same baseline template, **When** a component missing the `category` field is validated, **Then** the validation fails with `isValid` set to `false` and an error indicating the missing pre-filled metadata field `category`.

---

### User Story 3 - Load Schemas Dynamically from Designated Folder (Priority: P3)

As a system administrator, I want schemas to be loaded dynamically from a designated local folder, so that I can add, update, or remove component schemas without modifying or redeploying the validation engine.

**Why this priority**: Emphasizes maintainability and extensibility (Section VI and V of the Constitution). Keeping schemas outside the engine code allows the system to support new components seamlessly.

**Independent Test**: Can be fully tested by placing a new schema file in the designated schemas folder, and then validating a component of that type. The validator should automatically locate and apply the new schema.

**Acceptance Scenarios**:

1. **Given** a designated folder `schemas/` containing a schema file `quiz-schema.json`, **When** a validation request is made for a component of type `quiz`, **Then** the system loads the schema from `schemas/quiz-schema.json` and successfully validates the component.
2. **Given** a validation request for an unknown component type `unknown-widget`, **When** the validator searches the designated schemas folder and finds no corresponding schema file, **Then** the system fails safely with `isValid` set to `false` and returns a `SCHEMA_NOT_FOUND` error.

### Edge Cases

- **Malformed JSON Inputs**: If a component payload is not a valid JSON string (e.g., missing brackets, trailing commas), the validator must fail safely, returning `isValid: false` and a `SYNTAX_ERROR` code.
- **Empty or Null Inputs**: Submission of an empty string or null payload. The validator must fail safely, returning `isValid: false` with a specific `INVALID_INPUT` error.
- **Deeply Nested Objects**: If optional or required parameters contain deeply nested structures, the validator must verify all nested fields and report precise JSON Paths of any violations without crashing.
- **Schema Directory Access Failures**: If the designated schemas directory is missing, inaccessible, or contains invalid/corrupted JSON schemas, the validation must fail safely (default-deny), returning `isValid: false` and a `SCHEMA_DIRECTORY_UNAVAILABLE` or `SCHEMA_CORRUPTED` error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a REST API to accept validation requests and validate JSON component payloads against their corresponding JSON Schema stored in a local directory.
- **FR-002**: The system MUST enforce that all parameters marked as "required" in the schema are present in the JSON component.
- **FR-003**: The system MUST allow optional parameters (not marked as required in the schema) to be either present or absent in the JSON component without triggering validation errors.
- **FR-004**: The system MUST validate that any parameters present in the component match the data types, formats, or constraints defined in the schema.
- **FR-005**: The system MUST verify that all pre-filled/constant fields defined in the schema (e.g., constant string values, version numbers, type identifiers) are present and have the exact same values in the validated component.
- **FR-006**: The system MUST load schemas dynamically from a designated, configurable system folder (e.g., `schemas/`) based on the component type requested.
- **FR-007**: The system MUST fail safely ("default-deny") if a requested component type has no corresponding schema in the schemas folder, returning a `SCHEMA_NOT_FOUND` error.
- **FR-008**: The system MUST perform validations deterministically without utilizing any external cloud services or generative AI models, adhering to Section I of the Constitution.
- **FR-009**: The system MUST accumulate all validation errors and report them in a structured response rather than halting on the first error, as per Section II of the Constitution.
- **FR-010**: The system REST API MUST return validation results containing: `isValid` (boolean), a unique `correlationId` (for traceability under Section III of the Constitution), and a list of `errors` (each with `path` in JSON Path format, `code` indicating error type, and `message` describing the violation).

### Key Entities *(include if feature involves data)*

- **ComponentValidationRequest**: Represents the input container for a validation operation.
  - `componentPayload`: The raw JSON string representing the component instance to validate.
  - `componentType`: The unique name/identifier of the component (used to locate the matching schema file).
  - `correlationId`: A unique Correlation ID to trace the request throughout the validation workflow.
- **ComponentValidationResponse**: Represents the outcome of the validation process.
  - `isValid`: A boolean indicating whether the component complies perfectly with the schema.
  - `correlationId`: The matching ID from the request to ensure end-to-end traceability.
  - `errors`: A list of `ComponentValidationError` records.
  - `timestamp`: The date and time when the validation was executed (passed as an explicit deterministic parameter).
- **ComponentValidationError**: Represents a single validation violation.
  - `path`: The JSON Path locating the violation (e.g., `$.parameters.dosage` or `$.metadata.version`).
  - `code`: A machine-readable error string (e.g., `MISSING_REQUIRED_PARAMETER`, `INVALID_PARAMETER_TYPE`, `PREFILLED_FIELD_MISMATCH`, `SYNTAX_ERROR`, `SCHEMA_NOT_FOUND`).
  - `message`: A human-readable description of why validation failed.
- **ComponentSchema**: Represents a schema stored in the local file system.
  - `componentType`: The unique identifier corresponding to the schema's filename.
  - `schemaContent`: The schema definition specifying properties, required fields, and pre-filled/constant parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid JSON components matching their schemas (including required fields and correct pre-filled values) are successfully validated with `isValid: true` in under 20 milliseconds.
- **SC-002**: 100% of components missing required parameters or containing invalid parameter values are rejected with `isValid: false` and return complete, structured error lists.
- **SC-003**: 100% of components with mismatched or missing pre-filled fields (constants defined in the schema) are rejected with `isValid: false` and flag the mismatched properties with `PREFILLED_FIELD_MISMATCH` codes.
- **SC-004**: System validation performance remains stable (under 25 milliseconds per validation) when schemas are added or updated in the designated schemas folder, without requiring system recompilation.

## Assumptions

- **Target Users**: Integration developers and clinical system administrators who configure medical software components.
- **Environment**: The validation system is deployed in an environment with access to a local file system where the schemas are stored.
- **Matching Logic**: The component type requested corresponds exactly to the filename of the schema file (e.g., component type `medication` matches `schemas/medication.json`).
- **Pre-filled Fields Definition**: The schema defines "pre-filled/constant" fields using JSON Schema `const` properties or standard fixed value definitions, which must match the component exactly.
- **Traceability**: A valid `correlationId` is generated by the client or by the gateway of the validation service and is passed in with every request.

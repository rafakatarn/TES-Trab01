# Feature Specification: mHealth Component Validator

**Feature Branch**: `001-mhealth-component-validator`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "Criar um sistema chamado mHealth Component Validator, responsável por validar componentes de software representados em JSON. O sistema receberá um JSON gerado a partir de um prontuário clínico ou plano de cuidados de saúde e deverá verificar se esse JSON está em conformidade com o JSON Schema correspondente ao tipo de componente. A validação deve ser determinística, sem utilizar LLM ou inteligência artificial generativa. O sistema deve identificar erros de sintaxe e de conformidade com o schema, como campos obrigatórios ausentes, tipos incorretos, valores inválidos, propriedades não permitidas e estruturas incompatíveis. O resultado deve informar se o componente é válido e, quando inválido, apresentar erros detalhados indicando onde e por que a validação falhou. O sistema deve rejeitar componentes quando o tipo não for conhecido. O MVP deve ser focado exclusivamente na validação estrutural baseada em JSON Schema. Validação de coerência clínica, geração ou correção automática dos componentes ficam fora do escopo inicial."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Well-Formed and Compliant mHealth Components (Priority: P1)

As a health data system or clinical consumer, I want to validate well-formed clinical component payloads against registered JSON schemas, so that I can guarantee only syntactically and structurally correct data enters the health registry.

**Why this priority**: This is the core happy path for the system. Without validating correct payloads and confirming compliance, the tool cannot serve its primary purpose of ensuring data integrity for mHealth components.

**Independent Test**: Can be fully tested by submitting a valid clinical JSON component payload (e.g., a "medication" component) and a corresponding JSON Schema to the validator, verifying that it returns `isValid: true` and zero errors.

**Acceptance Scenarios**:

1. **Given** a registered JSON Schema for the component type `medication`, **When** a valid `medication` JSON component is validated, **Then** the system returns a successful validation result with `isValid` set to `true`, a list of errors containing 0 items, and the validated component metadata.
2. **Given** a registered JSON Schema for the component type `quiz`, **When** a valid `quiz` JSON component is validated, **Then** the system returns a successful validation result with `isValid` set to `true`, a list of errors containing 0 items, and the validated component metadata.

---

### User Story 2 - Return Detailed Structural and Schema Conformance Errors (Priority: P2)

As a clinical integration engineer, I want the validation system to identify all syntax and conformance errors, including missing required fields, incorrect types, invalid values, disallowed properties, and incompatible structures, so that I can quickly pinpoint where and why the payload failed validation.

**Why this priority**: It is crucial for client applications and developers to receive exact feedback on why a payload was rejected so they can fix issues in their source systems. This directly implements the "Fail-Safe / Validação à Prova de Falhas" principle.

**Independent Test**: Can be fully tested by passing a JSON payload with multiple schema violations (e.g., missing required field `dosage`, incorrect type for `timestamp`, and an extra disallowed field) and verifying that the validation result returns `isValid: false` along with a list of all detected errors, showing their precise JSON Path and specific validation rule violated.

**Acceptance Scenarios**:

1. **Given** a registered JSON Schema for the component type `medication` that defines `dosage` as a required integer and does not allow additional properties, **When** a JSON component missing the `dosage` field is validated, **Then** the system returns `isValid` set to `false` and a list of errors including one with error code `MISSING_REQUIRED_FIELD` pointing to the root or missing path.
2. **Given** a registered JSON Schema for the component type `medication`, **When** a JSON component is validated that contains a string for `dosage` (which requires an integer) and an unauthorized additional field `foo`, **Then** the system returns `isValid` set to `false` and a list of errors including error codes `INVALID_TYPE` for the `dosage` path, and `DISALLOWED_PROPERTY` for the `foo` path.
3. **Given** any validation request, **When** the input payload is a malformed JSON string (e.g., missing curly braces or trailing commas), **Then** the system returns `isValid` set to `false` and reports a single error with error code `SYNTAX_ERROR` detailing the JSON parsing failure.

---

### User Story 3 - Reject Unknown Component Types (Priority: P3)

As a health system administrator, I want the validator to reject any component whose type is not known or registered, so that the system fails safely and does not allow unverified component types to bypass checks.

**Why this priority**: This enforces "default-deny" behavior for safety (Section II of the Constitution). If a component type is unknown, we cannot perform standard structural validation, and it must be rejected immediately.

**Independent Test**: Can be fully tested by submitting a JSON payload of an unregistered component type (e.g., `unknown-clinical-resource`) and verifying that it is rejected with an explicit error code indicating that the type is unknown or unsupported.

**Acceptance Scenarios**:

1. **Given** a validation request with a component type identifier set to `unknown-clinical-resource`, **When** the validation is executed, **Then** the system returns `isValid` set to `false` and an error list containing an error with code `UNKNOWN_COMPONENT_TYPE` and a descriptive message.

### Edge Cases

- **Empty or Null Inputs**: Submission of empty string, blank JSON `{}` or null value as the payload. The system must fail safely with a `SYNTAX_ERROR` or `INVALID_INPUT` error, maintaining `isValid: false`.
- **Deeply Nested Structural Mismatches**: Arrays containing nested objects where primitives are expected. The system must report the exact nested path (JSON Path) of the incompatibility without crashing.
- **Large Payloads and Recursion Limits**: Extremely deep or large JSON payloads designed to cause stack overflows or denial of service. The system must handle these gracefully by enforcing parser limits or returning a structural depth error, returning `isValid: false`.
- **Schema Resolution Failures**: If a schema has internal dependencies or refs, the system must resolve them deterministically offline. If a ref is broken or unresolved, the validation must fail safely, returning `isValid: false` and a `SCHEMA_ERROR` code.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST validate clinical component JSON inputs against the matching JSON Schema using a deterministic, offline engine.
- **FR-002**: The system MUST NOT utilize any Large Language Models (LLM) or generative artificial intelligence for validation, parsing, or error generation.
- **FR-003**: O sistema MUST validate payloads in a purely functional manner without side effects, as per Section I of the Constitution (Validação Determinística).
- **FR-004**: O sistema MUST support structural conformance checks including: missing required fields, incorrect types, invalid ranges/values, unauthorized properties, and structural mismatches.
- **FR-005**: O sistema MUST detect and report parsing/syntax errors if the incoming payload is not a well-formed JSON string.
- **FR-006**: O sistema MUST reject the component immediately if its declared component type does not match any registered, known JSON Schema, throwing a `UNKNOWN_COMPONENT_TYPE` error.
- **FR-007**: O sistema MUST accumulate all schema conformance errors and report them together to provide comprehensive feedback, rather than halting at the first validation error (unless a fatal JSON syntax error prevents parsing).
- **FR-008**: O sistema MUST return validation results in a structured format containing: `isValid` (boolean), a unique correlation ID (`correlationId` for traceability), and a list of `errors` (each with `path` in JSON Path format, `code` indicating error type, and `message` describing the violation).
- **FR-009**: O sistema MUST mask or omit sensitive clinical data (PII) from error logs and public messages, conforming to Section II/Technical Requirements of the Constitution (Tratamento de Dados Sensíveis).

### Key Entities *(include if feature involves data)*

- **ValidationRequest**: Represents the input container for a validation operation.
  - `payload`: The raw JSON string or parsed object representing the clinical component.
  - `componentType`: The string identifier representing the type of component (e.g., `medication`, `quiz`).
  - `correlationId`: A unique Correlation ID to trace the validation request throughout the system.
- **ValidationResponse**: Represents the structural result of the validation process.
  - `isValid`: A boolean indicating if the payload is perfectly compliant.
  - `correlationId`: The matching ID from the request.
  - `errors`: A list of `ValidationError` records.
  - `timestamp`: The date and time the validation was performed (received as an explicit parameter or deterministic time reference).
- **ValidationError**: Represents a single detected conformance or syntax violation.
  - `path`: The JSON Path string locating the violating node (e.g., `$.body.value` or `$`).
  - `code`: A standardized machine-readable error string (e.g., `MISSING_REQUIRED_FIELD`, `INVALID_TYPE`, `DISALLOWED_PROPERTY`, `SYNTAX_ERROR`, `UNKNOWN_COMPONENT_TYPE`).
  - `message`: A clear, developer-friendly explanation of why validation failed at this path.
- **ComponentSchema**: Represents a registered JSON Schema mapping to a specific component type.
  - `componentType`: The unique name/identifier of the component.
  - `schema`: The JSON Schema specification (e.g., Draft-07 format) stored locally.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid components matching their registered JSON Schemas are validated with `isValid: true` in under 15 milliseconds.
- **SC-002**: 100% of invalid or malformed components are rejected with `isValid: false`, returning detailed error reports with correct JSON Path locations.
- **SC-003**: 100% of unknown component types are rejected with an explicit `UNKNOWN_COMPONENT_TYPE` error, preventing any unverified data from passing.
- **SC-004**: System validation is 100% deterministic (re-running the validation on the same payload 10,000 times produces identical outputs, preserving order of errors).
- **SC-005**: 100% of validation errors are mapped to specific, machine-readable error codes (`MISSING_REQUIRED_FIELD`, `INVALID_TYPE`, etc.) rather than generic exceptions.

## Assumptions

- **Component Type Identification**: The client specifies the expected component type as part of the validation request metadata, or it is derived from a top-level field (e.g., `componentType` or `resourceType`) in the payload.
- **Offline Schema Registry**: All supported schemas are pre-loaded in a local registry or local directory configuration. There is no dependency on remote servers to fetch or resolve JSON Schemas, ensuring compliance with Section I (Validação Determinística) and Section IV (Reprodutibilidade).
- **Schema Format**: All registered schemas are standard-compliant JSON Schemas (e.g., Draft-07 or newer).
- **Target Platform**: The validator is developed in a statically typed programming language, in compliance with the Project Constitution (Technical Requirements).
- **Scope Limit**: Clinical validation of actual medical values (e.g., verifying if a heart rate of 300 bpm makes clinical sense) and auto-correction/auto-generation of clinical payloads are out of scope for the MVP.

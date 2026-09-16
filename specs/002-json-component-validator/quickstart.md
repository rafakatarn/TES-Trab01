# Quickstart Validation Guide: JSON Component Validator

This guide demonstrates how to set up, run, and validate the JSON Component Validator service end-to-end.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **cURL** or any HTTP client (e.g. Postman) for making REST requests.

## Setup & Running the Service

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Place Schemas and Templates**:
   Ensure you have a `schemas/` directory at the root of your application with matching schema and template JSON files (refer to [Data Model](data-model.md) for structure):
   - `schemas/quiz.schema.json` (JSON Schema)
   - `schemas/quiz.template.json` (Baseline template structure)

3. **Start the server** (Development mode):
   ```bash
   npm run dev
   ```
   The service will start on port `3000` by default.

---

## Runnable End-to-End Validation Scenarios

Refer to [API Contract](contracts/api-contract.json) for schema details.

### Scenario 1: Happy Path - Valid Payload
Submit a JSON component that fully satisfies both the `quiz` JSON Schema and matching template.

- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/v1/validate \
    -H "Content-Type: application/json" \
    -H "X-Correlation-ID: 11111111-2222-3333-4444-555555555555" \
    -d '{
      "componentType": "quiz",
      "componentPayload": {
        "formatVersion": "1.0.0",
        "category": "clinical-device",
        "parameters": {
          "id": "quiz-001",
          "status": "active",
          "description": "Patient wellness check"
        }
      }
    }'
  ```

- **Expected Response (Status 200)**:
  ```json
  {
    "isValid": true,
    "correlationId": "11111111-2222-3333-4444-555555555555",
    "errors": [],
    "timestamp": "2026-09-16T14:30:00.000Z"
  }
  ```

---

### Scenario 2: Validation Failure - Missing Required Field
Submit a component where a required parameter (e.g., `status`) is missing from the payload.

- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/v1/validate \
    -H "Content-Type: application/json" \
    -d '{
      "componentType": "quiz",
      "componentPayload": {
        "formatVersion": "1.0.0",
        "category": "clinical-device",
        "parameters": {
          "id": "quiz-001"
        }
      }
    }'
  ```

- **Expected Response (Status 200)**:
  ```json
  {
    "isValid": false,
    "correlationId": "any-generated-uuid-v4",
    "errors": [
      {
        "path": "$.parameters.status",
        "code": "MISSING_REQUIRED_PARAMETER",
        "message": "should have required property 'status'"
      }
    ],
    "timestamp": "2026-09-16T14:31:00.000Z"
  }
  ```

---

### Scenario 3: Validation Failure - Pre-filled Template Mismatch
Submit a component where a pre-filled template field (e.g., `formatVersion`) does not match the baseline template file.

- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/v1/validate \
    -H "Content-Type: application/json" \
    -d '{
      "componentType": "quiz",
      "componentPayload": {
        "formatVersion": "2.0.0",
        "category": "clinical-device",
        "parameters": {
          "id": "quiz-001",
          "status": "active"
        }
      }
    }'
  ```

- **Expected Response (Status 200)**:
  ```json
  {
    "isValid": false,
    "correlationId": "any-generated-uuid-v4",
    "errors": [
      {
        "path": "$.formatVersion",
        "code": "PREFILLED_FIELD_MISMATCH",
        "message": "Template mismatch: expected value for 'formatVersion' to be '1.0.0', but got '2.0.0'."
      }
    ],
    "timestamp": "2026-09-16T14:32:00.000Z"
  }
  ```

## Running Automated Tests

To execute unit and integration test suites, run:
```bash
npm run test
```
The test suite validates controller isolation, service-level dynamic schema loading, and recursive template verification.

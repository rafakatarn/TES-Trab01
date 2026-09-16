# Implementation Plan: JSON Component Validator

**Branch**: `002-json-component-validator` | **Date**: 2026-09-16 | **Spec**: [Link to Spec.md](spec.md)

**Input**: Feature specification from `/specs/002-json-component-validator/spec.md`

## Summary

The goal of this feature is to implement a high-performance, highly modular, and extensible **JSON Component Validator** using TypeScript and Node.js. The service will be developed as an Express REST API to receive components and validate them deterministically. 

Our technical approach uses **AJV (Another JSON Schema Validator)** for standard schema checks (enforcing required/optional parameters and types) and a **Recursive Template Matcher** to verify that the component includes the correct pre-filled static/metadata fields defined in a baseline JSON template file stored alongside the schema.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js (v18.0.0+)

**Primary Dependencies**: `express`, `ajv` (JSON Schema Draft-07 engine), `uuid` (correlation tracking).

**Storage**: Local File System (`schemas/` directory to store JSON Schemas and Baseline JSON Templates).

**Testing**: `jest`, `supertest` (for in-memory REST API endpoint testing), `ts-jest`.

**Target Platform**: Node.js Container / Server environment.

**Project Type**: web-service

**Performance Goals**: Validation processing time < 20ms per compliant request (SC-001).

**Constraints**:
- Purely offline and deterministic (no external services or AI models).
- Default-deny security posture (rejection of unknown component types or missing schemas).
- Accumulation of all validation errors.
- Mandatory Correlation-ID traceability for logging and responses.

---

## Constitution Check

*GATE: Passed. Complies with 100% of the Primeiro_Projeto Constitution.*

| Core Principle | Compliance Strategy in Design | Status |
|---|---|---|
| **I. Validação Determinística** | Uses AJV engine and recursive structural comparisons. No external network requests, database lookups, or random/AI states. | **PASS** |
| **II. Validação à Prova de Falhas** | Enforces "default-deny". Any exception, missing file, or format error defaults to returning `isValid: false` and a structured error list without leaking internal stack traces. | **PASS** |
| **III. Rastreabilidade** | Tracks and attaches a unique UUID v4 `correlationId` to all logging entries and HTTP validation responses. | **PASS** |
| **IV. Reprodutibilidade** | Uses pinned dependency versions in `package.json` and standardized in-memory Jest + Supertest suites. | **PASS** |
| **V. Manutenibilidade** | Cleanly decouples HTTP controllers, disk schema/template loader service, AJV validation, and template comparison utility. | **PASS** |
| **VI. Extensibilidade** | Dynamically loads schemas and baseline templates from a designated folder based on requested component type, avoiding recompilation or redeployment for new component types. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-json-component-validator/
├── spec.md              # Feature specification
├── plan.md              # This file (Technical Implementation Plan)
├── research.md          # Phase 0 Research output
├── data-model.md        # Phase 1 Data Model schemas and types
├── quickstart.md        # Phase 1 End-to-End Validation Quickstart Guide
├── contracts/
│   └── api-contract.json # OpenAPI 3.0.3 specification of REST contract
└── checklists/
    └── requirements.md  # Specification Quality Checklist
```

### Source Code Layout

The project is structured as a standard single-project TypeScript layout to minimize directory complexity:

```text
src/
├── app.ts                  # Express application setup and middleware
├── server.ts               # Server entry point (starts listener)
├── controllers/
│   └── validator.controller.ts  # Handles requests, maps schemas, and returns responses
├── services/
│   ├── validation.service.ts    # Service orchestrating AJV & template verification
│   ├── schema-loader.service.ts # Disk reader for loading schemas/templates dynamically
│   └── template-match.service.ts # Recursive utility verifying pre-filled fields
├── utils/
│   └── logger.ts           # Traceable JSON logging middleware/utility
├── types/
│   └── index.ts            # Type definitions (e.g., ComponentValidationRequest)
└── schemas/                # Folder for registered JSON schemas & baseline templates
    ├── quiz.schema.json
    └── quiz.template.json

tests/
├── integration/
│   └── validator.api.test.ts # End-to-end integration test of API endpoints
└── unit/
    ├── schema-loader.test.ts # Tests dynamic disk-loading & default-deny error handling
    └── template-match.test.ts # Tests recursive template validation & mismatch detection
```

**Structure Decision**: A single-project TypeScript setup with segregated directories for routers/controllers and pure validation services. This maintains clean code decoupling while avoiding multi-package overhead.

---

## Complexity Tracking

*No constitution violations detected or introduced. No complex patterns or unnecessary abstractions utilized.*

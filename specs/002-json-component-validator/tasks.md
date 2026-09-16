# Tasks: JSON Component Validator

**Input**: Design documents from `/specs/002-json-component-validator/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize TypeScript and Node.js project configuration in `package.json` and `tsconfig.json`
- [x] T002 Install standard production dependencies (express, ajv, uuid) and dev dependencies (typescript, ts-node-dev, jest, ts-jest, supertest, types) in `package.json`
- [x] T003 [P] Configure Jest testing and coverage options in `jest.config.ts`
- [x] T004 [P] Configure ESLint and Prettier configurations in `.eslintrc.json` and `.prettierrc`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement JSON log tracking utility with correlation tracking support in `src/utils/logger.ts`
- [x] T006 Configure application Express middleware (JSON body parsing, Correlation-ID header injection, error handling middleware) in `src/app.ts`
- [x] T007 Create shared TypeScript interfaces and models for ComponentValidationRequest and ComponentValidationResponse in `src/types/index.ts`
- [x] T008 Create a dynamic Schema and Template loader service to load JSON Schema and baseline JSON files from the system folder in `src/services/schema-loader.service.ts`
- [x] T009 [P] Implement default-deny and file path safety rules (preventing path traversal attacks) within the disk-loader logic in `src/services/schema-loader.service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Validate Component Parameters Against Schemas (Priority: P1) 🎯 MVP

**Goal**: Validate component parameters and types using schemas loaded dynamically from local folders.

**Independent Test**: Send a valid/invalid component payload to the validator endpoint; verify successful `isValid: true` response or error arrays pointing to specific paths on failure.

### Tests for User Story 1

- [x] T010 [P] [US1] Create unit tests to verify the dynamic schema loading, compilation, and error accumulation of the AJV validator in `tests/unit/schema-loader.test.ts`
- [x] T011 [P] [US1] Create REST API integration tests to verify successful and failed schema validation cases in `tests/integration/validator.api.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Implement standard AJV validator compilation and error parsing/accumulation service layer in `src/services/validation.service.ts`
- [x] T013 [US1] Create HTTP endpoint handler (route & controller) to receive validation requests and dispatch schema validation in `src/controllers/validator.controller.ts` and `src/app.ts`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Match Pre-filled/Static Schema Fields (Priority: P2)

**Goal**: Enforce that the component includes the correct pre-filled fields defined in a baseline JSON template/skeleton file stored alongside the schema.

**Independent Test**: Post a component payload with mismatched or missing pre-filled fields; verify response returns `isValid: false` and `PREFILLED_FIELD_MISMATCH` errors pointing to specific JSON paths.

### Tests for User Story 2

- [x] T014 [P] [US2] Create unit tests to verify recursive baseline template matching and mismatch reporting logic in `tests/unit/template-match.test.ts`
- [x] T015 [P] [US2] Create REST API integration tests to verify successful template matching and correct PREFILLED_FIELD_MISMATCH responses in `tests/integration/validator.api.test.ts`

### Implementation for User Story 2

- [x] T016 [US2] Implement recursive baseline template matching utility verifying that all template fields exist and match in the payload in `src/services/template-match.service.ts`
- [x] T017 [US2] Integrate the template matcher utility into the core validation service layer in `src/services/validation.service.ts`

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Load Schemas Dynamically from Designated Folder (Priority: P3)

**Goal**: Load schemas dynamically from a designated local folder based on requested component type, defaulting to safe failure if not found.

**Independent Test**: Validate a component type whose schema is missing; verify response returns `isValid: false` and a `SCHEMA_NOT_FOUND` error.

### Tests for User Story 3

- [x] T018 [P] [US3] Create integration tests verifying dynamic directory schema loading and default-deny unknown types in `tests/integration/validator.api.test.ts`

### Implementation for User Story 3

- [x] T019 [US3] Connect the local folder lookup directory (configurable path via environment) to the schema loader service in `src/services/schema-loader.service.ts` and `src/app.ts`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: General refinements, packaging, and final E2E verification tests.

- [x] T020 [P] Place sample component schemas and templates (e.g., `quiz.schema.json` and `quiz.template.json`) in the standard schemas directory in `src/schemas/quiz.schema.json` and `src/schemas/quiz.template.json`
- [x] T021 Add API entrypoint script to launch HTTP listener in `src/server.ts`
- [x] T022 Run the entire integration and unit test suite verifying SC-001 (performance targets) and full path coverage using `npm run test`
- [x] T023 Run manual API validation requests as described in `specs/002-json-component-validator/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion. User stories proceed in sequential priority order (P1 → P2 → P3).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

---

## Parallel Example: User Story 1

```bash
# Launch both test files for User Story 1 together:
Task T010: "Create unit tests to verify the dynamic schema loading... in tests/unit/schema-loader.test.ts"
Task T011: "Create REST API integration tests... in tests/integration/validator.api.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify that standard JSON schema validation endpoint operates perfectly.

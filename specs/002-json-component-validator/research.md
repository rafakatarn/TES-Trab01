# Research & Architecture Decisions: JSON Component Validator

## Research Topic 1: JSON Schema Validation Engine

- **Decision**: Use **AJV (Another JSON Schema Validator)** with Draft-07 support.
- **Rationale**: 
  - AJV is the industry-standard JSON Schema validator for the Node.js/TypeScript ecosystem.
  - It compiles schemas into highly optimized JavaScript code, offering exceptional performance (<1ms compilation/execution per request), easily satisfying **SC-001** (<20ms SLA).
  - It is strictly compliant with JSON Schema draft specifications and has built-in support for detailed error accumulation, satisfying **Principle II (Validação à Prova de Falhas)**.
- **Alternatives Considered**:
  - `jsonschema`: Less actively maintained and significantly slower than AJV.
  - `zod`: Excellent for code-first validation but lacks native support for loading and executing raw standard JSON Schema files dynamically at runtime without translation.

---

## Research Topic 2: Baseline JSON Template Matching for Pre-filled Fields

- **Decision**: Implement a **Recursive Template Matcher** utility that compares the component payload against the baseline JSON template file.
- **Rationale**:
  - As decided in the clarification session (Option B), pre-filled fields will be defined in a baseline JSON template/skeleton file (e.g., `quiz-template.json`) stored alongside the schema.
  - The matcher will recursively traverse the template and verify that every field present in the template is also present in the component with the exact same value.
  - This separation ensures JSON Schema only manages type-safety, optional/required checks, and ranges, while the template file manages boilerplate/fixed metadata compliance.
- **Alternatives Considered**:
  - JSON Schema `const` properties: Rejected to keep the schemas cleaner and to allow a visual baseline template file that developers can easily copy and paste.
  - Lodash `isEqual`: Rejected because `isEqual` requires absolute equality, which would fail when the component contains optional parameters that are not in the baseline template. A one-way structural comparison is necessary.

---

## Research Topic 3: Web Framework & REST Interface

- **Decision**: **Express** with TypeScript.
- **Rationale**:
  - Minimalist and modular, allowing clean separation of concerns: router -> controller -> validation service -> response constructor.
  - Vast ecosystem and effortless integration of middleware for correlation tracking (**Principle III - Rastreabilidade**).
- **Alternatives Considered**:
  - `NestJS`: Too much boilerplate and overhead for a single-purpose microservice.
  - `Fastify`: Excellent performance, but Express is more idiomatic and simpler to bootstrap.

---

## Research Topic 4: Testing Strategy & Framework

- **Decision**: **Jest** combined with **Supertest** for integration testing.
- **Rationale**:
  - Jest provides a robust assertion library, mocking utilities, and built-in coverage reporting in a single package.
  - Supertest allows testing Express endpoints end-to-end in-memory, avoiding the need to spin up a live network port during CI/CD.
- **Alternatives Considered**:
  - `Mocha` + `Chai` + `NYC`: Requires managing three separate dependencies, leading to higher configuration complexity.

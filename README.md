# NovaTrade Frontend

NovaTrade is the reference frontend used in _Building Software Around the Business — Not Around the Framework: Frontend Architecture with TypeScript and Angular_.

The repository is not only the final application. It preserves the implementation history behind the book: Domain and Application code, Angular presentation, REST and GraphQL adapters, a React framework-substitution experiment, local development servers, automated tests, and chapter-by-chapter Git milestones.

The project was built around one recurring question:

> **Who owns this responsibility?**

The architecture was not designed upfront. It emerged incrementally as implementation pressure made new boundaries necessary.

The guiding principles are:

> **No pattern without pressure.**
> **No infrastructure without a requirement.**
> **No architectural claim without proof.**

## Architecture

The final repository is organized around responsibility:

```text
src/
├── core/
│   ├── application/
│   └── domain/
│
├── infrastructure/
│   └── adapters/
│       ├── graphql/
│       ├── in-memory/
│       └── rest/
│
├── angular/
│   ├── app/
│   ├── composition/
│   ├── features/
│   └── main.ts
│
├── react/
│   ├── app/
│   ├── composition/
│   ├── features/
│   └── main.ts
│
└── environments/
```

Supporting development infrastructure lives outside `src/`:

```text
development-server/
├── data/
├── graphql/
└── rest/

e2e/
├── config/
├── features/
└── scripts/
```

At a high level:

```text
Angular UI ─┐
            ├──> Application ───> Domain
React UI ───┘         │
                      │ Application ports
                      ▼
                technical adapters
                 ├── REST
                 ├── GraphQL
                 └── in-memory
```

This is an ownership view rather than a claim that every technical implementation is framework-neutral. The Angular REST and GraphQL adapters use Angular `HttpClient`, while the React experiment uses a separate browser `fetch` implementation.

## What the Repository Demonstrates

The implementation explores and verifies architectural ideas through actual pressure rather than introducing them as a predefined template:

- business rules moving out of presentation code and into the Domain;
- Application use cases coordinating workflows;
- backend capabilities expressed through Application ports;
- REST knowledge moving to technical adapters;
- local and workflow-level state ownership;
- server-authoritative state after mutations;
- specialized read shapes when consumers need different information;
- capability-specific ports when one broad interface creates unnecessary coupling;
- explicit runtime composition;
- REST-to-GraphQL transport substitution;
- Angular-to-React framework substitution for a controlled user journey.

The repository also deliberately does **not** introduce several patterns when the implementation never earns them, including a global NgRx store, SignalStore architecture, full CQRS, command/query buses, a custom dependency container, or a framework-neutral UI abstraction.

## Technology

The project uses:

```text
Angular            22.1.x
React              19.3.x
TypeScript         6.0.x
RxJS               7.8.x
Vitest             4.0.x
Playwright         1.63.x
Vite               8.3.x
Tailwind CSS       4.1.x
GraphQL            17.0.x
```

The exact dependency versions are defined in `package.json` and `package-lock.json`.

## Requirements

Install a compatible Node.js version and npm.

Verify your environment:

```bash
node --version
npm --version
```

Install the locked dependencies:

```bash
npm ci
```

For normal development, you can also use:

```bash
npm install
```

## Run NovaTrade With REST

Start the Angular frontend together with the local REST development server:

```bash
npm run start:rest-api
```

This runs:

```text
Angular frontend
+
REST development server
```

The individual commands are:

```bash
npm run serve:rest-api
npm run mock-rest
```

The Angular application runs on:

```text
http://localhost:4200
```

## Run NovaTrade With GraphQL

Start the Angular frontend using the GraphQL adapter and local GraphQL development server:

```bash
npm run start:graphql-api
```

The individual commands are:

```bash
npm run serve:graphql-api
npm run mock-graphql
```

The same Application and Domain are used. Angular composition selects the GraphQL implementation instead of the REST implementation.

## Run the React Substitution Experiment

The React code is intentionally a narrow architectural probe rather than a second complete NovaTrade frontend.

Start the React frontend with the REST development server:

```bash
npm run start:react-rest
```

This runs:

```text
React / Vite frontend
+
REST development server
```

The individual commands are:

```bash
npm run serve:react-rest
npm run mock-rest
```

The React development server runs on:

```text
http://localhost:4300
```

The browser entry page is:

```text
http://localhost:4300/react.html
```

The experiment verifies that the existing business-facing Application and Domain can support a real Orders load-and-cancel journey without becoming React-specific.

It does **not** attempt to reproduce the entire Angular frontend.

## Development Data

The local REST and GraphQL servers use JSON-backed development data:

```text
development-server/data/
├── db.fixture.json
└── db.json
```

`db.fixture.json` contains the known starting state used by automated browser tests.

`db.json` is the mutable development copy.

Reset the development database with:

```bash
npm run reset:development-db
```

## Tests

### General Project Tests

Run the main test suite once:

```bash
npm test -- --watch=false
```

### React-Focused Tests

Run the React-specific test suite:

```bash
npm run test:react
```

### React TypeScript Verification

The React experiment has a dedicated TypeScript configuration:

```bash
npx tsc --project tsconfig.react.json
```

A successful run produces no type errors.

### REST E2E

Run the verified browser journey against REST:

```bash
npm run e2e:rest
```

### GraphQL E2E

Run the same browser journey against GraphQL:

```bash
npm run e2e:graphql
```

Both commands reset the development database before running Playwright.

### Playwright UI Mode

REST:

```bash
npm run e2e:rest:ui
```

GraphQL:

```bash
npm run e2e:graphql:ui
```

General Playwright UI mode:

```bash
npm run e2e:ui
```

## Full Verification

A useful verification sequence for the final repository state is:

```bash
npm test -- --watch=false
npm run test:react
npx tsc --project tsconfig.react.json
npm run e2e:rest
npm run e2e:graphql
```

These commands provide different forms of evidence. A passing unit test does not prove the same boundary as a browser E2E test, and a successful TypeScript check does not prove runtime integration.

The book treats architectural claims in the same way: the evidence should match the claim.

## Build

Create a production Angular build with:

```bash
npm run build
```

The generated files are written to:

```text
dist/
```

For a development build that watches for file changes:

```bash
npm run watch
```

## Important Source Locations

### Domain

```text
src/core/domain/
```

Contains business concepts and rules such as `Order`, `OrderLine`, and Order calculations.

### Application

```text
src/core/application/
```

Contains use cases and outbound capability contracts.

Current use cases include:

```text
loadOrder()
listOrders()
placeOrder()
cancelOrder()
```

### Technical Adapters

```text
src/infrastructure/adapters/
```

Contains the in-memory, REST, and GraphQL implementations used throughout the book.

### Angular Edge

```text
src/angular/
```

Contains Angular-specific presentation, workflow state, dependency injection, composition, and bootstrap code.

### React Edge

```text
src/react/
```

Contains the deliberately narrow React substitution experiment.

### Local Backend Simulators

```text
development-server/
```

Contains the REST and GraphQL development servers and their fixture data.

### Browser Tests

```text
e2e/
```

Contains Playwright configuration, test setup, and real user-journey verification.

## Chapter Tags

The repository accompanies the book chapter by chapter.

Completed implementation milestones are preserved with annotated Git tags:

```text
chapter-01
chapter-02
chapter-03
...
```

To inspect a chapter snapshot without moving an existing branch:

```bash
git switch --detach chapter-26
```

Return to the latest version with:

```bash
git switch main
```

Compare two chapter milestones:

```bash
git diff chapter-25..chapter-26
```

Inspect the commits between them:

```bash
git log --oneline chapter-25..chapter-26
```

A chapter tag represents a book milestone. Some retrospective or conceptual chapters may not require a new public source-code change.

## TDD and Implementation History

When new behavior is introduced, the project follows a strict test-driven workflow:

```text
write the test
      ↓
run it
      ↓
inspect the actual result
      ↓
genuine RED
      ↓
smallest GREEN
      ↓
run the tests again
```

A tooling or configuration failure is not treated as an architectural RED.

Likewise, if a new test passes immediately because the current implementation already satisfies the requirement, that immediate GREEN is preserved rather than manufacturing a failure.

The Git history is intentionally useful for studying how the architecture evolved.

## Repository Philosophy

This repository is not intended to demonstrate the maximum number of architectural patterns that can fit into an Angular project.

Its purpose is the opposite.

A new structure is introduced only when existing code experiences enough pressure to justify it. Measurements are allowed to conclude that no optimization is required. Patterns are allowed to remain absent. Framework-specific code is allowed to remain framework-specific when that is its correct owner.

The architecture therefore follows a recurring decision loop:

```text
pressure
    ↓
smallest responsible response
    ↓
proof
    ↓
new pressure
```

The final structure is a consequence of those decisions, not the starting point.

## Related Book

This repository accompanies:

**Building Software Around the Business — Not Around the Framework**
_Frontend Architecture with TypeScript and Angular_

The book explains the reasoning behind the implementation history. The repository provides the executable evidence.

Use them together:

```text
book
→ why the architecture changed

repository
→ what actually changed
```

## License

The source code in this repository is licensed under the MIT License.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and reuse the code, including in commercial projects, subject to the terms of the license.

See [`LICENSE`](LICENSE) for the full license text.

The MIT License applies to the source code in this repository. The accompanying book manuscript, text, diagrams, and other publication content are separately copyrighted and are not covered by the MIT License.

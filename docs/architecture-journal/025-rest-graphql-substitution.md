# REST to GraphQL Substitution

## Context

NovaTrade already depended on backend capabilities through the existing `OrderApi` boundary rather than calling REST directly from the Orders feature.

Until this chapter, however, only one real production-style transport adapter existed:

```text
ORDER_API
    ↓
RestOrderApi
    ↓
REST development server
```

That structure suggested that REST was an implementation detail, but the architecture had not yet proved the claim through substitution.

Chapter 31 established a real browser-level cancellation journey through the assembled REST-backed system. Chapter 32 reuses that journey as the baseline for a controlled transport experiment.

## Architectural Claim

> The frontend Application depends on required backend capabilities, not REST.

The experiment must therefore replace the transport implementation without requiring changes to the higher-level frontend architecture.

## Controlled Variable

The controlled change is:

```text
RestOrderApi + REST server
            ↓
GraphqlOrderApi + GraphQL server
```

The following remain stable:

```text
Domain
Application
use cases
OrderApi contract
Orders feature
OrderPage
user-visible cancellation behavior
Playwright cancellation journey
```

The existing `cancel-order.spec.ts` is deliberately reused unchanged for both transports.

## Explicit Composition

Before introducing GraphQL, the `OrderApi` selection was extracted from `app.config.ts` into an explicit composition provider.

The application configuration now consumes:

```text
ORDER_API_PROVIDER
```

while transport-specific compositions bind the same `ORDER_API` token independently:

```text
REST composition
    ↓
ORDER_API
    ↓
RestOrderApi
```

and:

```text
GraphQL composition
    ↓
ORDER_API
    ↓
GraphqlOrderApi
```

Angular build configurations select the appropriate composition without requiring a manual source-code change.

The resulting development modes are:

```text
npm run start:rest-api
npm run start:graphql-api
```

## GraphQL Adapter

`GraphqlOrderApi` implements the same existing `OrderApi` contract as `RestOrderApi`.

The verified capability surface is:

```text
getOrder()     → Promise<Order>
listOrders()   → Promise<OrderSummary[]>
placeOrder()   → Promise<void>
cancelOrder()  → Promise<void>
```

The adapter uses Angular `HttpClient` directly to send GraphQL documents over HTTP. No dedicated GraphQL client library was required for the experiment.

The GraphQL collection query requests only the fields required by the collection read:

```text
id
status
total
itemCount
```

rather than fetching complete order lines.

## Real GraphQL Boundary

Adapter-level tests initially verified GraphQL-shaped requests and response mapping through Angular's HTTP testing support.

That was not considered sufficient evidence for transport substitution.

A real GraphQL development server was therefore introduced using the GraphQL reference implementation. It parses and validates GraphQL documents, executes resolvers, and reads and writes the same development state used by the REST server.

The real GraphQL boundary was verified directly.

A query for `ORD-1002` returned:

```text
id: ORD-1002
status: Submitted
total: 109.97
```

with its real order lines.

The collection query returned the compact `OrderSummary` shape for the development fixture.

The real `placeOrder` mutation changed `ORD-1001` from:

```text
Draft
→
Submitted
```

and a subsequent GraphQL query confirmed the persisted state.

The real `cancelOrder` mutation changed `ORD-1002` from:

```text
Submitted
→
Cancelled
```

and a subsequent GraphQL query again confirmed the persisted state.

## Shared Development State

Introducing a second transport exposed an ownership problem in the existing development-server structure.

Previously, the development database lived under the REST server directory:

```text
REST
└── db.json
```

Once GraphQL also needed the same state, the database was no longer REST-owned.

The development infrastructure was reorganized to:

```text
development-server/
├── data/
│   ├── db.json
│   └── db.fixture.json
├── rest/
│   └── server.mjs
└── graphql/
    └── server.mjs
```

Both transports now depend on shared development state rather than GraphQL reaching into REST-owned files.

The database reset script was updated accordingly.

## Infrastructure Ownership

The second transport and explicit runtime composition also created real organizational pressure in the frontend source tree.

Technical integration code now consists of:

```text
multiple adapters
+
runtime composition
```

That earned the move to:

```text
src/app/infrastructure/
├── adapters/
│   ├── in-memory/
│   ├── rest/
│   └── graphql/
└── composition/
```

The move was performed only after the responsibilities existed. It was not introduced in anticipation of future architecture.

## Substitution Proof

Playwright was configured to execute the same browser journey against either composition.

The REST execution used:

```text
npm run e2e:rest
```

and produced:

```text
1 passed
```

The GraphQL execution used:

```text
npm run e2e:graphql
```

and produced:

```text
1 passed
```

Both executions ran the same unchanged test:

```text
e2e/features/orders/cancel-order.spec.ts
```

The journey remained:

```text
customer selects submitted ORD-1002
        ↓
clicks Cancel order
        ↓
Angular UI
        ↓
Application
        ↓
Domain lifecycle rule
        ↓
OrderApi capability
        ↓
selected transport adapter
        ↓
real development backend
        ↓
persisted cancellation
        ↓
authoritative reload
        ↓
UI displays Cancelled
```

Only the transport implementation and corresponding backend changed.

## Regression Verification

After the transport substitution and the final infrastructure reorganization, the existing automated suite was rerun:

```text
Test Files  13 passed (13)
Tests       62 passed (62)
```

The system-level proofs were also rerun:

```text
REST E2E     1 passed
GraphQL E2E  1 passed
```

## What the Experiment Proves

The evidence supports this narrow conclusion:

> The tested Orders path depends on the existing `OrderApi` capability rather than on REST specifically.

For the verified cancellation journey, NovaTrade can replace:

```text
RestOrderApi
```

with:

```text
GraphqlOrderApi
```

without changing:

```text
Domain
Application
use cases
OrderApi contract
Orders feature
browser journey
```

The transport choice belongs to composition.

## What the Experiment Does Not Prove

This experiment does not prove:

- that every frontend capability is transport-independent;
- that every REST endpoint has a GraphQL equivalent;
- that GraphQL is preferable to REST;
- that NovaTrade should migrate entirely to GraphQL;
- that the current GraphQL development server represents a production GraphQL architecture;
- that all transport-specific failure semantics are identical;
- that every user journey works through both transports.

One meaningful capability and one real user journey were sufficient to test the architectural claim.

## Consequence

REST is no longer merely described as an implementation detail.

For the verified Orders path, it has been replaced by another transport while the higher-level frontend architecture remained stable.

The claim survived the substitution.

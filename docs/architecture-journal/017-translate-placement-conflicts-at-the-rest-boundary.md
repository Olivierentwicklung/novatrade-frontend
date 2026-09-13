# 017 — Translate Placement Conflicts at the REST Boundary

## Context

NovaTrade places Orders through the `OrderApi` capability.

The production implementation, `RestOrderApi`, communicates with the backend through HTTP. Until now, successful placement was enough for the frontend workflow:

```text
App
    ↓
OrderApi
    ↓
RestOrderApi
    ↓
HTTP
```

The backend can also reject placement.

One concrete rejection is returned as:

```text
409 Conflict
```

That status code has meaning at the REST boundary, but the Application should not need to understand HTTP semantics in order to react to the failure.

## Pressure

Without translation, the placement workflow would have to reason about transport details such as:

```text
409
HttpErrorResponse
HTTP status codes
```

That would reverse the boundary established around `OrderApi`.

The Application needs to know:

```text
the Order could not be placed
```

It does not need to know:

```text
the server expressed that fact with HTTP 409
```

The two languages are related, but they belong to different responsibilities.

## Decision

`RestOrderApi` translates the relevant HTTP conflict into an explicit application-level placement rejection.

Conceptually:

```text
HTTP 409 Conflict
        ↓
RestOrderApi
        ↓
placement rejection
        ↓
Application / UI workflow
```

HTTP interpretation therefore remains inside the REST adapter.

Higher-level code reacts to the meaning of the failure rather than the transport mechanism that communicated it.

## Responsibility Boundary

```text
RestOrderApi
    understands HTTP failure semantics

Application
    understands placement outcome

Presentation
    communicates the outcome to the customer
```

The resulting flow is:

```text
transport failure
        ↓
application meaning
        ↓
presentation
```

## Why

`OrderApi` exists so that higher-level frontend behavior depends on the backend capability NovaTrade needs rather than on REST itself.

Allowing `409 Conflict` to escape into the Application would weaken that boundary.

Translation belongs in `RestOrderApi` because that adapter is the place where both sides of the translation are known:

```text
HTTP representation
        ↕
OrderApi semantics
```

The adapter can therefore discard the transport-specific detail once it has extracted the meaning required by the frontend workflow.

## Customer Feedback

Translation alone is not sufficient for the user experience.

When placement is rejected, the UI communicates that the Order could not be placed.

The presentation does not inspect HTTP status codes.

It receives application meaning and decides how that meaning should be presented to the customer.

This preserves:

```text
REST adapter
    → protocol interpretation

Application
    → workflow meaning

UI
    → customer communication
```

## What We Deliberately Did Not Add

- universal error hierarchy
- generic `ApiError`
- generic HTTP error mapper
- error-code registry
- global error service
- centralized error bus
- retry framework
- transport details in the Application
- HTTP status handling in the UI

Only the placement conflict has demonstrated a need for explicit translation.

Other failures remain unchanged until their meaning creates separate pressure.

## Testing Boundary

`rest-order-api.spec.ts` proves the REST translation:

```text
HTTP 409
        ↓
application-level placement rejection
```

`app.spec.ts` proves the workflow consequence:

```text
placement rejected
        ↓
customer receives feedback
```

These tests prove different responsibilities.

The Application test does not need Angular HTTP infrastructure.

The REST adapter test does not need to prove presentation behavior.

## Consequences

The Application remains independent of HTTP status codes.

The presentation remains independent of REST.

`RestOrderApi` has gained responsibility for translating one meaningful transport failure.

The frontend now has an explicit way to reason about rejected placement without creating a general error architecture.

A future failure may require another translation.

That decision will be made when the failure has application meaning worth distinguishing—not merely because another HTTP status code exists.

# 016 — Keep HTTP Behind the OrderApi Port

## Context

NovaTrade already had an application port named `OrderApi`. Its purpose is to express the backend capability required by the frontend without exposing a particular transport mechanism to the application workflow.

The first REST implementation used the browser `fetch` API. During Chapter 20 the REST adapter was moved to Angular `HttpClient`, which is the natural HTTP mechanism for an Angular application.

The initial wiring created `RestOrderApi` inside `App` and supplied `HttpClient` there. Although the application still called the `OrderApi` methods, the composition component now knew that its implementation was REST-based and depended on Angular HTTP infrastructure.

## Decision

`App` will depend only on the `OrderApi` port.

Angular's composition configuration will map an `ORDER_API` injection token to `RestOrderApi`.

`RestOrderApi` alone will depend on `HttpClient`.

```text
App
    ↓
OrderApi
    ↓
ORDER_API
    ↓
RestOrderApi
    ↓
HttpClient
```

The `OrderApi` contract remains Promise-based:

```ts
getOrder(orderId: string): Promise<Order>;
placeOrder(orderId: string): Promise<void>;
```

The REST adapter may internally use Angular Observables and convert the single HTTP result with `firstValueFrom()`.

## Why

The application needs the capability to load and place Orders. It does not need to know which Angular HTTP class implements that capability.

Keeping `HttpClient` inside the REST adapter prevents transport infrastructure from leaking into the workflow owner and preserves the Dependency Inversion established by `OrderApi`.

This also produces a cleaner testing boundary:

```text
app.spec.ts
→ fake OrderApi
→ tests application/UI workflow

rest-order-api.spec.ts
→ HttpTestingController
→ tests REST behavior
```

## Consequences

`App` can be tested without HTTP infrastructure.

`RestOrderApi` remains free to use Angular-specific facilities because it is an Angular-side adapter.

The application port remains independent of RxJS and Angular.

Changing transport implementation does not require changing the workflow code that depends on `OrderApi`.

The composition root carries the responsibility of choosing the concrete implementation.

## What This Decision Does Not Mean

This decision does not introduce a general dependency-injection framework into the Domain or Application layers.

It does not require every adapter dependency to have its own abstraction.

It does not predict a future transport or justify the port through a hypothetical replacement.

`OrderApi` already existed because earlier requirements created pressure for a backend boundary. This decision only prevents the newly adopted Angular HTTP infrastructure from leaking back across that established boundary.

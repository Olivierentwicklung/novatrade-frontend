# Orders Feature Ownership

## Context

Chapter 28 was originally expected to expose feature-boundary pressure through one feature depending on another feature's internal implementation.

Before implementing that story, the current NovaTrade frontend was inspected.

That pressure did not exist.

There was no established history in which one feature imported another feature's:

- private state;
- private service;
- private model;
- implementation details.

The implementation therefore did not justify introducing a feature boundary for that reason.

The planned pressure was not manufactured.

## Pressure

As Order behavior continued to grow, the root `App` accumulated responsibility for:

- loading the Order collection;
- selecting the first available Order;
- loading the selected Order;
- checkout form state;
- edit/review workflow;
- navigation synchronization;
- Order placement;
- pending placement state;
- placement failure;
- Order cancellation;
- authoritative reloads.

Several coherent responsibilities became visible.

The Order list was extracted into its own component, initialization was clarified, tests were reorganized by behavior, and the repository structure was aligned with concepts already earned by the implementation.

Those refactorings remained behavior-preserving.

The more important ownership question then became visible:

> Is the root application really the owner of the Orders experience?

By this point, `App` was effectively the entire user-facing Orders application rather than a neutral NovaTrade application shell.

That distinction mattered independently of whether a second feature had already been implemented.

## Decision

Give the Orders presentation an explicit owner.

The Orders presentation now lives under:

```text
features/
└── orders/
    └── presentation/
        ├── order-page/
        ├── order-editor/
        ├── order-list/
        └── order-review/
```

The previous Order-specific root behavior moved into:

```text
OrderPage
```

Responsibility is now:

```text
App
└── application shell / composition

OrderPage
├── Order loading
├── Order selection
├── checkout
├── review workflow
├── placement
└── cancellation
```

The root `App` no longer directly owns Orders behavior.

## Why This Is a Feature Boundary

The boundary was not introduced because another feature had already violated Orders internals.

It was introduced because application ownership and feature ownership had become different responsibilities.

The distinction is:

```text
application ownership
≠
feature ownership
```

and:

```text
component extraction
≠
feature boundary
```

`OrderList` had already been extracted earlier for a focused presentation responsibility.

That extraction alone did not establish a feature.

The feature boundary became meaningful only when the Orders experience itself needed an owner independent of the application shell.

## Tests Followed Ownership

The behavioral tests that previously lived under the root `App` moved with the Orders behavior to:

```text
features/orders/presentation/order-page/order-page.spec.ts
```

Those tests continue to cover:

- Order selection;
- empty Order collection handling;
- checkout behavior;
- review navigation;
- Order placement;
- placement failure;
- duplicate placement protection;
- submitted-Order presentation;
- Order cancellation.

The root `App` retains only a narrow application-assembly test.

This produces the same ownership distinction in the test suite:

```text
app.spec.ts
→ application shell assembly

order-page.spec.ts
→ Orders experience
```

## Deliberate Non-Decisions

The following remain outside `features/orders/`:

```text
domain/
application/
adapters/
```

The current implementation proves presentation ownership.

It does not prove that every Order-related Domain, Application, or Adapter concept should now move beneath the feature.

Do not automatically create:

```text
features/orders/domain/
features/orders/application/
features/orders/adapters/
```

without additional ownership pressure.

The implementation also did not justify:

- `public-api.ts`;
- `shared/`;
- feature facades;
- bounded-context terminology;
- feature-specific DI containers;
- SignalStore;
- global state;
- micro-frontends;
- empty sibling feature folders for hypothetical future capabilities.

## Evidence

Relevant Chapter 28 commits:

```text
5ff93d5 test: select first order from order list
2a4b310 feat: derive displayed order from order list
e2f2f37 test: display selected order from order list
c1a104c feat: display selected order from order list
2a73d0b feat: hide checkout controls for submitted orders
ed965eb refactor: extract order list component
063ef58 refactor: clarify app initialization
50b27bf refactor: organize app tests by behavior
09b82b1 refactor: align frontend structure with architecture
1fb1274 refactor: introduce orders feature boundary
```

Latest verified test result after the feature-boundary refactor:

```text
Test Files  11 passed (11)
Tests       56 passed (56)
```

## Consequence

The frontend now expresses a clearer ownership model:

```text
App
→ NovaTrade application shell

features/orders/
→ owner of the user-facing Orders experience
```

This creates room for future capabilities without making the root `App` the owner of every product workflow.

It also creates a new question for later development:

> What should happen when code currently owned by one feature becomes useful somewhere else?

That question is not answered here.

Reuse does not automatically erase ownership.

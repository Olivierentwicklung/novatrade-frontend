import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { OrderApi } from './application/ports/order-api';

import { ORDER_API } from './application/ports/order-api.token';
import { Order } from './domain/order';
import { OrderLine } from './domain/order-line';
import { OrderEditor } from './order-editor/order-editor';
import { OrderPlacementRejected } from './application/errors/order-placement-rejected';

describe('App', () => {
  // Build the App test mock directly from OrderApi.
  // - keyof OrderApi gives: "getOrder" | "placeOrder" | "listOrders"
  // - OrderApi[K] gets the original function type for each method
  // - vi.fn<OrderApi[K]> creates a Vitest mock with that same signature
  // Result: if OrderApi changes later, this mock type changes with it.
  type OrderApiMock = {
    [K in keyof OrderApi]: ReturnType<typeof vi.fn<OrderApi[K]>>;
  };

  let orderApi: OrderApiMock;

  function draftOrder(): Order {
    return new Order(
      'ORD-1001',
      'Draft',
      [new OrderLine('Mechanical Keyboard', 1, 129.99)],
      129.99,
    );
  }

  function arrangeDraftOrder(): void {
    orderApi.listOrders.mockResolvedValue([
      {
        id: 'ORD-1001',
        status: 'Draft',
        total: 129.99,
        itemCount: 1,
      },
    ]);

    orderApi.getOrder.mockResolvedValue(draftOrder());
  }

  beforeEach(async () => {
    orderApi = {
      getOrder: vi.fn().mockResolvedValue(draftOrder()),
      placeOrder: vi.fn().mockResolvedValue(undefined),
      cancelOrder: vi.fn().mockResolvedValue(undefined),
      listOrders: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ORDER_API,
          useValue: orderApi satisfies OrderApi,
        },
      ],
    }).compileComponents();
  });

  describe('creation', () => {
    it('should create the app', () => {
      const fixture = TestBed.createComponent(App);

      expect(fixture.componentInstance).toBeTruthy();
    });
  });

  describe('checkout workflow', () => {
    it('should move from editing an order to reviewing it and back', async () => {
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.order.set(draftOrder());

      fixture.componentInstance.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('app-order-editor')).toBeTruthy();

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();
      fixture.detectChanges();

      expect(compiled.textContent).toContain('Review order');
      expect(compiled.querySelector('app-order-editor')).toBeNull();

      const editButton = compiled.querySelector('[aria-label="Edit order"]') as HTMLButtonElement;

      editButton.click();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-editor')).toBeTruthy();
    });

    it('should preserve the edited order when returning from review', async () => {
      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await fixture.whenStable();

      fixture.componentInstance.order.set(
        new Order('ORD-1001', 'Draft', [new OrderLine('Wireless Mouse', 2, 49.99)], 99.98),
      );

      fixture.detectChanges();

      let editor = fixture.debugElement.query(By.directive(OrderEditor))
        .componentInstance as OrderEditor;

      editor.increaseProductQuantity('Wireless Mouse');
      fixture.detectChanges();

      expect(fixture.componentInstance.order()?.lines[0].quantity).toBe(3);

      fixture.componentInstance.reviewOrder();
      fixture.detectChanges();

      fixture.componentInstance.editOrder();
      fixture.detectChanges();

      editor = fixture.debugElement.query(By.directive(OrderEditor))
        .componentInstance as OrderEditor;

      expect(editor.order()?.lines[0].quantity).toBe(3);
    });

    it('should not continue to review without required checkout details', async () => {
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.order.set(draftOrder());

      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-editor')).toBeTruthy();
      expect(compiled.querySelector('app-order-review')).toBeNull();
    });

    it('should not continue to review with an invalid email address', async () => {
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.order.set(draftOrder());

      fixture.componentInstance.checkoutModel.set({
        email: 'not-an-email',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-editor')).toBeTruthy();
      expect(compiled.querySelector('app-order-review')).toBeNull();
    });

    it('should continue to review after entering valid checkout details', async () => {
      arrangeDraftOrder();

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.status).toBe('Draft');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const emailInput = compiled.querySelector('#checkout-email') as HTMLInputElement;

      const addressInput = compiled.querySelector('#delivery-address') as HTMLInputElement;

      emailInput.value = 'customer@example.com';
      emailInput.dispatchEvent(new Event('input'));

      addressInput.value = 'Example Street 10';
      addressInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-review')).toBeTruthy();

      expect(compiled.querySelector('app-order-editor')).toBeNull();
    });

    it('should only offer order placement from the review step', async () => {
      arrangeDraftOrder();

      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.status).toBe('Draft');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('[aria-label="Place order"]')).toBeNull();

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();
      fixture.detectChanges();

      expect(compiled.querySelector('[aria-label="Place order"]')).toBeTruthy();
    });
  });

  describe('order placement', () => {
    it('should reload the authoritative order after placement', async () => {
      const fixture = TestBed.createComponent(App);
      const component = fixture.componentInstance;

      const localOrder = draftOrder();

      component.order.set(localOrder);

      orderApi.getOrder.mockResolvedValue(
        new Order(
          'ORD-1001',
          'Submitted',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      await component.placeCurrentOrder();

      expect(orderApi.placeOrder).toHaveBeenCalledOnce();
      expect(orderApi.placeOrder).toHaveBeenCalledWith('ORD-1001');

      expect(orderApi.getOrder).toHaveBeenCalledOnce();
      expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-1001');

      expect(component.order()?.status).toBe('Submitted');
    });

    it('should show a meaningful message when order placement is rejected', async () => {
      const fixture = TestBed.createComponent(App);
      const component = fixture.componentInstance;

      component.order.set(draftOrder());

      orderApi.placeOrder.mockRejectedValue(new OrderPlacementRejected());

      await component.placeCurrentOrder();

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('[role="alert"]')?.textContent).toContain(
        'This order can no longer be placed.',
      );
    });

    it('should not place the order again while placement is already in progress', async () => {
      const fixture = TestBed.createComponent(App);
      const component = fixture.componentInstance;

      component.order.set(draftOrder());

      let resolvePlacement!: () => void;

      orderApi.placeOrder.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePlacement = resolve;
          }),
      );

      const firstPlacement = component.placeCurrentOrder();

      await Promise.resolve();

      const secondPlacement = component.placeCurrentOrder();

      expect(orderApi.placeOrder).toHaveBeenCalledOnce();

      resolvePlacement();

      await firstPlacement;
      await secondPlacement;
    });

    it('should show that placement is in progress while waiting for the backend', async () => {
      const fixture = TestBed.createComponent(App);
      const component = fixture.componentInstance;

      component.order.set(draftOrder());

      component.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      component.reviewOrder();
      fixture.detectChanges();

      let resolvePlacement!: () => void;

      orderApi.placeOrder.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePlacement = resolve;
          }),
      );

      const compiled = fixture.nativeElement as HTMLElement;

      const placeButton = compiled.querySelector('[aria-label="Place order"]') as HTMLButtonElement;

      placeButton.click();
      fixture.detectChanges();

      expect(placeButton.disabled).toBe(true);
      expect(placeButton.textContent).toContain('Placing order');

      resolvePlacement();

      await fixture.whenStable();
    });
  });

  describe('navigation', () => {
    it('should represent the review step in navigation', async () => {
      arrangeDraftOrder();

      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.status).toBe('Draft');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();

      await fixture.whenStable();
      fixture.detectChanges();

      const location = TestBed.inject(Location);

      expect(location.path()).toBe('/checkout/review');
    });

    it('should return to editing when navigating back from review', async () => {
      arrangeDraftOrder();

      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.status).toBe('Draft');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const reviewButton = compiled.querySelector(
        '[aria-label="Review order"]',
      ) as HTMLButtonElement;

      reviewButton.click();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-review')).toBeTruthy();

      const location = TestBed.inject(Location);

      location.back();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(compiled.querySelector('app-order-editor')).toBeTruthy();
      expect(compiled.querySelector('app-order-review')).toBeNull();
    });

    it('should restore the review step from the initial navigation location', async () => {
      const location = TestBed.inject(Location);

      location.go('/checkout/review');

      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.checkoutModel.set({
        email: 'customer@example.com',
        deliveryAddress: 'Example Street 10',
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('app-order-review')).toBeTruthy();
      expect(compiled.querySelector('app-order-editor')).toBeNull();
    });
  });

  describe('submitted order lifecycle', () => {
    it('should show a submitted order as read-only information', () => {
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.order.set(
        new Order(
          'ORD-1001',
          'Submitted',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('ORD-1001');
      expect(compiled.textContent).toContain('Mechanical Keyboard');
      expect(compiled.textContent).toContain('Submitted');

      expect(
        compiled.querySelector('[aria-label="Increase Mechanical Keyboard quantity"]'),
      ).toBeNull();

      expect(
        compiled.querySelector('[aria-label="Decrease Mechanical Keyboard quantity"]'),
      ).toBeNull();

      expect(compiled.querySelector('[aria-label="Remove Mechanical Keyboard"]')).toBeNull();
    });

    it('should offer cancellation for a submitted order', () => {
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.order.set(
        new Order(
          'ORD-1001',
          'Submitted',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('[aria-label="Cancel order"]')).toBeTruthy();
    });

    it('should cancel the submitted order and reload the authoritative state', async () => {
      const fixture = TestBed.createComponent(App);
      const component = fixture.componentInstance;

      component.order.set(
        new Order(
          'ORD-1001',
          'Submitted',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      orderApi.cancelOrder = vi.fn().mockResolvedValue(undefined);

      orderApi.getOrder.mockResolvedValue(
        new Order(
          'ORD-1001',
          'Cancelled',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      const cancelButton = compiled.querySelector(
        '[aria-label="Cancel order"]',
      ) as HTMLButtonElement;

      cancelButton.click();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(orderApi.cancelOrder).toHaveBeenCalledOnce();
      expect(orderApi.cancelOrder).toHaveBeenCalledWith('ORD-1001');

      expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-1001');

      expect(component.order()?.status).toBe('Cancelled');
    });

    it('should not show checkout controls for a submitted order', async () => {
      orderApi.listOrders.mockResolvedValue([
        {
          id: 'ORD-2001',
          status: 'Submitted',
          total: 129.99,
          itemCount: 1,
        },
      ]);

      orderApi.getOrder.mockResolvedValue(
        new Order(
          'ORD-2001',
          'Submitted',
          [new OrderLine('Mechanical Keyboard', 1, 129.99)],
          129.99,
        ),
      );

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.status).toBe('Submitted');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('#checkout-email')).toBeNull();
      expect(compiled.querySelector('#delivery-address')).toBeNull();
      expect(compiled.querySelector('[aria-label="Review order"]')).toBeNull();
      expect(compiled.textContent).not.toContain('Your order is not placed yet.');
    });
  });

  describe('order list and selection', () => {
    it('should show the customer a list of order summaries', async () => {
      orderApi.listOrders.mockResolvedValue([
        {
          id: 'ORD-1001',
          status: 'Submitted',
          total: 129.99,
          itemCount: 1,
        },
        {
          id: 'ORD-1002',
          status: 'Draft',
          total: 99.98,
          itemCount: 2,
        },
      ]);

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.orders()).toHaveLength(2);
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('ORD-1001');
      expect(compiled.textContent).toContain('Submitted');
      expect(compiled.textContent).toContain('129.99');
      expect(compiled.textContent).toContain('1 item');

      expect(compiled.textContent).toContain('ORD-1002');
      expect(compiled.textContent).toContain('Draft');
      expect(compiled.textContent).toContain('99.98');
      expect(compiled.textContent).toContain('2 items');
    });

    it('should display the first order from the order list', async () => {
      orderApi.listOrders.mockResolvedValue([
        {
          id: 'ORD-2001',
          status: 'Draft',
          total: 79.99,
          itemCount: 1,
        },
        {
          id: 'ORD-2002',
          status: 'Submitted',
          total: 129.99,
          itemCount: 1,
        },
      ]);

      orderApi.getOrder.mockImplementation(async (orderId) => {
        if (orderId === 'ORD-2001') {
          return new Order('ORD-2001', 'Draft', [new OrderLine('USB-C Hub', 1, 79.99)], 79.99);
        }

        throw new Error(`Unexpected order id: ${orderId}`);
      });

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-2001');
        expect(fixture.componentInstance.order()?.id).toBe('ORD-2001');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('USB-C Hub');
    });

    it('should not load an order when the order list is empty', async () => {
      orderApi.listOrders.mockResolvedValue([]);

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(orderApi.listOrders).toHaveBeenCalled();
      });

      expect(orderApi.getOrder).not.toHaveBeenCalled();
      expect(fixture.componentInstance.order()).toBeNull();
    });

    it('should show an empty state when there are no orders', async () => {
      orderApi.listOrders.mockResolvedValue([]);

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.ordersLoaded()).toBe(true);
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(orderApi.getOrder).not.toHaveBeenCalled();
      expect(compiled.textContent).toContain("You don't have any orders yet.");
      expect(compiled.textContent).not.toContain('Loading order...');
    });

    it('should display the selected order from the order list', async () => {
      orderApi.listOrders.mockResolvedValue([
        {
          id: 'ORD-2001',
          status: 'Draft',
          total: 79.99,
          itemCount: 1,
        },
        {
          id: 'ORD-2002',
          status: 'Submitted',
          total: 129.99,
          itemCount: 1,
        },
      ]);

      orderApi.getOrder.mockImplementation(async (orderId) => {
        if (orderId === 'ORD-2001') {
          return new Order('ORD-2001', 'Draft', [new OrderLine('USB-C Hub', 1, 79.99)], 79.99);
        }

        if (orderId === 'ORD-2002') {
          return new Order(
            'ORD-2002',
            'Submitted',
            [new OrderLine('Mechanical Keyboard', 1, 129.99)],
            129.99,
          );
        }

        throw new Error(`Unexpected order id: ${orderId}`);
      });

      const fixture = TestBed.createComponent(App);

      fixture.detectChanges();

      await vi.waitFor(() => {
        expect(fixture.componentInstance.order()?.id).toBe('ORD-2001');
      });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const orderButtons = compiled.querySelectorAll('[data-order-id]');

      expect(orderButtons.length).toBe(2);

      (orderButtons[1] as HTMLButtonElement).click();

      await vi.waitFor(() => {
        expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-2002');
        expect(fixture.componentInstance.order()?.id).toBe('ORD-2002');
      });

      fixture.detectChanges();

      expect(compiled.textContent).toContain('Mechanical Keyboard');
    });
  });
});

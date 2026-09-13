import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { App } from './app';
import { OrderApi } from './application/ports/order-api';
import { ORDER_API } from './application/ports/order-api.token';
import { Order } from './domain/order';
import { OrderLine } from './domain/order-line';
import { OrderEditor } from './order-editor/order-editor';

describe('App', () => {
  type OrderApiMock = {
    getOrder: ReturnType<typeof vi.fn<(orderId: string) => Promise<Order>>>;
    placeOrder: ReturnType<typeof vi.fn<(orderId: string) => Promise<void>>>;
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

  beforeEach(async () => {
    orderApi = {
      getOrder: vi.fn().mockResolvedValue(draftOrder()),
      placeOrder: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ORDER_API,
          useValue: orderApi satisfies OrderApi,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should move from editing an order to reviewing it and back', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.componentInstance.checkoutModel.set({
      email: 'customer@example.com',
      deliveryAddress: 'Example Street 10',
    });

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-order-editor')).toBeTruthy();

    const reviewButton = compiled.querySelector('[aria-label="Review order"]') as HTMLButtonElement;

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

    editor = fixture.debugElement.query(By.directive(OrderEditor)).componentInstance as OrderEditor;

    expect(editor.order()?.lines[0].quantity).toBe(3);
  });

  it('should reload the authoritative order after placement', async () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    const localOrder = draftOrder();

    component.order.set(localOrder);

    orderApi.getOrder.mockResolvedValue(
      new Order('ORD-1001', 'Submitted', [new OrderLine('Mechanical Keyboard', 1, 129.99)], 129.99),
    );

    await component.placeCurrentOrder();

    expect(orderApi.placeOrder).toHaveBeenCalledOnce();
    expect(orderApi.placeOrder).toHaveBeenCalledWith('ORD-1001');

    expect(orderApi.getOrder).toHaveBeenCalledOnce();
    expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-1001');

    expect(component.order()?.status).toBe('Submitted');
  });

  it('should not continue to review without required checkout details', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const reviewButton = compiled.querySelector('[aria-label="Review order"]') as HTMLButtonElement;

    reviewButton.click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-order-editor')).toBeTruthy();

    expect(compiled.querySelector('app-order-review')).toBeNull();
  });

  it('should not continue to review with an invalid email address', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.componentInstance.checkoutModel.set({
      email: 'not-an-email',
      deliveryAddress: 'Example Street 10',
    });

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const reviewButton = compiled.querySelector('[aria-label="Review order"]') as HTMLButtonElement;

    reviewButton.click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-order-editor')).toBeTruthy();

    expect(compiled.querySelector('app-order-review')).toBeNull();
  });

  it('should continue to review after entering valid checkout details', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const emailInput = compiled.querySelector('#checkout-email') as HTMLInputElement;

    const addressInput = compiled.querySelector('#delivery-address') as HTMLInputElement;

    emailInput.value = 'customer@example.com';
    emailInput.dispatchEvent(new Event('input'));

    addressInput.value = 'Example Street 10';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const reviewButton = compiled.querySelector('[aria-label="Review order"]') as HTMLButtonElement;

    reviewButton.click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-order-review')).toBeTruthy();

    expect(compiled.querySelector('app-order-editor')).toBeNull();
  });

  it('should show a meaningful message when order placement is rejected', async () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    component.order.set(draftOrder());

    orderApi.placeOrder.mockRejectedValue(new Error('Order placement rejected'));

    await component.placeCurrentOrder();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain(
      'This order can no longer be placed.',
    );
  });
});

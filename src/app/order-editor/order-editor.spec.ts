import { TestBed } from '@angular/core/testing';

import { afterEach, vi } from 'vitest';
import { OrderEditor } from './order-editor';
import { Order } from '../domain/order';
import { OrderLine } from '../domain/order-line';

describe('Order Editor', () => {
  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await TestBed.configureTestingModule({
      imports: [OrderEditor],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setTestOrder(orderEditor: OrderEditor) {
    orderEditor.order.set(
      new Order(
        'ORD-1001',
        'Draft',
        [
          new OrderLine('Mechanical Keyboard', 1, 129.99),
          new OrderLine('Wireless Mouse', 2, 49.99),
        ],
        229.97,
      ),
    );
  }

  it('should display the order', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('ORD-1001');
    expect(compiled.textContent).toContain('Mechanical Keyboard');
    expect(compiled.textContent).toContain('Wireless Mouse');
    expect(compiled.textContent).toContain('Draft');
    expect(compiled.textContent).toContain('229.97');
  });

  it('should increase a product quantity and update the total', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const increaseButton = compiled.querySelector(
      '[aria-label="Increase Wireless Mouse quantity"]',
    ) as HTMLButtonElement;

    increaseButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Quantity: 3');
    expect(compiled.textContent).toContain('279.96');
  });

  it('should remove a product from the order and update the total', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const removeButton = compiled.querySelector(
      '[aria-label="Remove Wireless Mouse"]',
    ) as HTMLButtonElement;

    removeButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('Wireless Mouse');
    expect(compiled.textContent).toContain('129.99');
  });

  it('should not decrease a product quantity below one', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const decreaseButton = compiled.querySelector(
      '[aria-label="Decrease Mechanical Keyboard quantity"]',
    ) as HTMLButtonElement;

    decreaseButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Quantity: 1');
  });

  it('should place a draft order', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const submitButton = compiled.querySelector('[aria-label="Place order"]') as HTMLButtonElement;

    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Submitted');
  });

  it('should not place an order without products', async () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const removeMechanicalKeyboardButton = compiled.querySelector(
      '[aria-label="Remove Mechanical Keyboard"]',
    ) as HTMLButtonElement;

    const removeWirelessMouseButton = compiled.querySelector(
      '[aria-label="Remove Wireless Mouse"]',
    ) as HTMLButtonElement;

    removeMechanicalKeyboardButton.click();
    fixture.detectChanges();

    removeWirelessMouseButton.click();
    fixture.detectChanges();

    const placeOrderButton = compiled.querySelector(
      '[aria-label="Place order"]',
    ) as HTMLButtonElement;

    placeOrderButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Draft');
  });

  it('should display the total price for a product entry', () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    orderEditor.order.set(
      new Order('ORD-TEST', 'Draft', [new OrderLine('Test Product', 3, 20)], 60),
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const productEntry = Array.from(compiled.querySelectorAll('article')).find((element) =>
      element.textContent?.includes('Test Product'),
    );

    expect(productEntry).toBeTruthy();
    expect(productEntry?.textContent).toContain('Quantity: 3');
    expect(productEntry?.textContent).toContain('Unit price: 20');
    expect(productEntry?.textContent).toContain('Line total: 60');
  });

  it('should disable decreasing a product at minimum quantity', () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    setTestOrder(orderEditor);

    fixture.detectChanges();

    orderEditor.order.set(
      new Order('ORD-TEST', 'Draft', [new OrderLine('Test Product', 1, 20)], 20),
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const decreaseButton = compiled.querySelector(
      '[aria-label="Decrease Test Product quantity"]',
    ) as HTMLButtonElement;

    expect(decreaseButton.disabled).toBe(true);
  });

  it('should display the order loaded through the application', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        id: 'ORD-2002',
        status: 'Draft',
        lines: [
          {
            product_name: 'USB-C Dock',
            quantity: 1,
            unit_price: 89.99,
          },
        ],
        total: 89.99,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const fixture = TestBed.createComponent(OrderEditor);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    await component.loadOrder();

    expect(fetchMock).toHaveBeenCalledWith('/api/orders/ORD-1001/');
    const order = component.order();

    if (!order) {
      throw new Error('Expected order to be loaded');
    }

    expect(order.id).toBe('ORD-2002');
    expect(order.lines[0].productName).toBe('USB-C Dock');

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('ORD-2002');
    expect(compiled.textContent).toContain('USB-C Dock');
    expect(compiled.textContent).toContain('89.99');
  });

  it('should not display an order before it has been loaded', () => {
    const fixture = TestBed.createComponent(OrderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain('ORD-1001');
    expect(compiled.textContent).not.toContain('Mechanical Keyboard');
  });

  it('should show a loading message before the order has been loaded', () => {
    const fixture = TestBed.createComponent(OrderEditor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Loading order...');
  });

  it('should derive the displayed total from the current order lines', () => {
    const fixture = TestBed.createComponent(OrderEditor);
    const orderEditor = fixture.componentInstance;

    orderEditor.order.set(
      new Order(
        'ORD-1001',
        'Draft',
        [new OrderLine('Mechanical Keyboard', 1, 100), new OrderLine('Wireless Mouse', 2, 25)],
        999,
      ),
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Total: 150');
  });
});

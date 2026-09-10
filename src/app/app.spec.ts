import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { OrderLine } from './order-line';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should display the order', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('ORD-1001');
    expect(compiled.textContent).toContain('Mechanical Keyboard');
    expect(compiled.textContent).toContain('Wireless Mouse');
    expect(compiled.textContent).toContain('Draft');
    expect(compiled.textContent).toContain('229.97');
  });

  it('should increase a product quantity and update the total', async () => {
    const fixture = TestBed.createComponent(App);
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
    const fixture = TestBed.createComponent(App);
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
    const fixture = TestBed.createComponent(App);
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
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const submitButton = compiled.querySelector('[aria-label="Place order"]') as HTMLButtonElement;

    submitButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Submitted');
  });

  it('should not place an order without products', async () => {
    const fixture = TestBed.createComponent(App);
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
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.order.lines = [new OrderLine('Test Product', 3, 20)];

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
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.order.lines = [new OrderLine('Test Product', 1, 20)];

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const decreaseButton = compiled.querySelector(
      '[aria-label="Decrease Test Product quantity"]',
    ) as HTMLButtonElement;

    expect(decreaseButton.disabled).toBe(true);
  });
});

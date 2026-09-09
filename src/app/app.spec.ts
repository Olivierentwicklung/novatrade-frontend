import { TestBed } from '@angular/core/testing';
import { App } from './app';

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

  it('should update the total when a product quantity increases', async () => {
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

  it('should update the total when a product is removed', async () => {
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

  it('should not reduce a product quantity below one', async () => {
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

  it('should submit a draft order', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const submitButton = compiled.querySelector('[aria-label="Submit order"]') as HTMLButtonElement;

    submitButton.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Submitted');
  });
});

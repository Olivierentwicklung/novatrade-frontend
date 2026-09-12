import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { By } from '@angular/platform-browser';
import { Order } from './domain/order';
import { OrderLine } from './domain/order-line';
import { OrderEditor } from './order-editor/order-editor';

describe('App', () => {
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should move from editing an order to reviewing it and back', () => {
    const fixture = TestBed.createComponent(App);
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

  it('should preserve the edited order when returning from review', () => {
    const fixture = TestBed.createComponent(App);

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
});

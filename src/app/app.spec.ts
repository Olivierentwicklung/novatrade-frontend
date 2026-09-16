import { TestBed } from '@angular/core/testing';

import { InMemoryOrderApi } from './infrastructure/adapters/in-memory/in-memory-order-api';

import { App } from './app';
import { ORDER_API } from './features/orders/presentation/di/order-api.token';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ORDER_API,
          useClass: InMemoryOrderApi,
        },
      ],
    }).compileComponents();
  });

  it('should create the application shell', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });
});

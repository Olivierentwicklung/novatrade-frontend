import { TestBed } from '@angular/core/testing';

import { InMemoryOrderApi } from './adapters/in-memory/in-memory-order-api';
import { ORDER_API } from './application/ports/order-api.token';
import { App } from './app';

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

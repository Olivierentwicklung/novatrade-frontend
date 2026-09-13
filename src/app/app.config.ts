import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { RestOrderApi } from './adapters/rest/rest-order-api';
import { ORDER_API } from './application/ports/order-api.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    RestOrderApi,

    {
      provide: ORDER_API,
      useExisting: RestOrderApi,
    },
  ],
};

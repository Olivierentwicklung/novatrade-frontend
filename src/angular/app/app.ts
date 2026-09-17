import { Component } from '@angular/core';

import { OrderPage } from '../features/orders/presentation/pages/order-page/order-page';

@Component({
  selector: 'app-root',
  imports: [OrderPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

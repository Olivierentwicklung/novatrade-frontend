import { Component } from '@angular/core';
import { OrderEditor } from './order-editor/order-editor';

@Component({
  selector: 'app-root',
  imports: [OrderEditor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

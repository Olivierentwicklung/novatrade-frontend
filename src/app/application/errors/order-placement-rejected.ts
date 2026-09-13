export class OrderPlacementRejected extends Error {
  constructor() {
    super('Order placement rejected');
    this.name = 'OrderPlacementRejected';
  }
}

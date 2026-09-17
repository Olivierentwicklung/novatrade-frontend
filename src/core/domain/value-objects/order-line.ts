export class OrderLine {
  constructor(
    readonly productName: string,
    readonly quantity: number,
    readonly unitPrice: number,
  ) {
    if (quantity < 1) {
      throw new Error('Order line quantity must be at least one');
    }
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }
}

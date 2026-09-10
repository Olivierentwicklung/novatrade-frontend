export class OrderLine {
  constructor(
    readonly productName: string,
    readonly quantity: number,
    readonly unitPrice: number,
  ) {}

  get total(): number {
    return this.quantity * this.unitPrice;
  }
}

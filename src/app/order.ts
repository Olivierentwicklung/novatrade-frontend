import { OrderLine } from './order-line';

export class Order {
  constructor(
    readonly id: string,
    public status: string,
    public lines: OrderLine[],
    public total: number,
  ) {}

  hasSameIdentityAs(other: Order): boolean {
    return this.id === other.id;
  }

  place(): void {
    if (this.lines.length === 0) {
      return;
    }

    this.status = 'Submitted';
  }
}

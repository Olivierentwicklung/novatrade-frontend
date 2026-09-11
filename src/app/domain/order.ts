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

  canBePlaced(): boolean {
    return this.status === 'Draft' && this.lines.length > 0;
  }

  place(): void {
    if (!this.canBePlaced()) {
      return;
    }

    this.status = 'Submitted';
  }
}

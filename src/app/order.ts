export class Order {
  constructor(
    readonly id: string,
    readonly status: string,
  ) {}

  hasSameIdentityAs(other: Order): boolean {
    return this.id === other.id;
  }
}

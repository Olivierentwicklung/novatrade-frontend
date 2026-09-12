export interface OrderDto {
  id: string;
  status: string;
  lines: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  total: number;
}

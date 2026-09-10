import { calculateLineTotal } from './calculate-line-total';
describe('calculateLineTotal', () => {
  it('should calculate the total for a product entry', () => {
    expect(calculateLineTotal(3, 20)).toBe(60);
  });
});

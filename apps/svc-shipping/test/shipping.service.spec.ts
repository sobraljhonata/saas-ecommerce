import { ShippingService } from '../src/modules/shipping/shipping.service';

describe('ShippingService', () => {
  it('prepare retorna true por padrão', () => {
    const svc = new ShippingService();
    expect(svc.prepare()).toBe(true);
  });
});

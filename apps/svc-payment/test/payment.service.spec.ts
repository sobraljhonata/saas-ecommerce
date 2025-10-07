import { PaymentService } from '../src/modules/payment/payment.service';

describe('PaymentService', () => {
  it('autoriza quando amount < rejectOver', () => {
    const svc = new PaymentService();
    expect(svc.authorize(49, 50)).toBe(true);
    expect(svc.authorize(50, 50)).toBe(false);
  });
});

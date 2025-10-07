"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("../src/modules/payment/payment.service");
describe('PaymentService', () => {
    it('autoriza quando amount < rejectOver', () => {
        const svc = new payment_service_1.PaymentService();
        expect(svc.authorize(49, 50)).toBe(true);
        expect(svc.authorize(50, 50)).toBe(false);
    });
});
//# sourceMappingURL=payment.service.spec.js.map
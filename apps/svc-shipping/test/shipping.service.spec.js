"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shipping_service_1 = require("../src/modules/shipping/shipping.service");
describe('ShippingService', () => {
    it('prepare retorna true por padrão', () => {
        const svc = new shipping_service_1.ShippingService();
        expect(svc.prepare()).toBe(true);
    });
});
//# sourceMappingURL=shipping.service.spec.js.map
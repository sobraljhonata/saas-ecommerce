import { Inject, Injectable } from '@nestjs/common';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { PaymentConfig } from '@saas/shared-config';

@Injectable()
export class PaymentService {
  constructor(@Inject(CONFIG as ConfigToken<PaymentConfig>) private readonly cfg: PaymentConfig) {}

  authorize(amount: number) {
    return { authorized: amount <= this.cfg.REJECT_OVER };
  }
}

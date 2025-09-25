import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  authorize(amount: number, rejectOver: number) {
    return amount < rejectOver;
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class ShippingService {
  // pode adicionar regras (CEP bloqueado, etc). Por enquanto sempre OK.
  prepare(): boolean { return true; }
}

import { z } from 'zod';
import { BaseSchema } from './base';

export const InventoryConfigSchema = BaseSchema; // hoje sem DB
export type InventoryConfig = z.output<typeof InventoryConfigSchema>;

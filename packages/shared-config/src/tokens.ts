// Porta de configuração — token DI independente do Nest
export const CONFIG = Symbol('SAAS_CONFIG');
export type ConfigToken<T> = typeof CONFIG & { __t?: T };
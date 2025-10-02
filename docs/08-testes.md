## Unitários (Jest)
- **Padrão**: mocks via submódulo `@saas/shared-kafka/testing` mapeado em `tsconfig.spec.json` e `jest.config.ts`.
- Separação de `tsconfig.build.json` (exclui `test/`) e `tsconfig.spec.json` (inclui `test/` e `paths` de mocks).

### Exemplo — mock de Kafka
- `jest.config.ts`:
```ts
moduleNameMapper: {
  '^@saas/shared-kafka$': '<rootDir>/test/stubs/shared-kafka.ts',
  '^@saas/shared-kafka/testing$': '<rootDir>/test/stubs/shared-kafka.ts',
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.loadEnv = loadEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string().url(),
    KAFKA_BROKERS: zod_1.z.string().default("localhost:9092"),
    TENANT_ID: zod_1.z.string().uuid().optional()
});
function loadEnv() {
    const parsed = exports.envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error(parsed.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables");
    }
    return parsed.data;
}
//# sourceMappingURL=index.js.map
import { kv as vercelKv } from "@vercel/kv";

// In-memory fallback for local development if Vercel KV environment variables are missing
const globalForKv = global as unknown as { memoryStore: Record<string, Record<string, string>> };
const memoryStore = globalForKv.memoryStore || (globalForKv.memoryStore = {});

const mockKv = {
    async hset(key: string, value: Record<string, string>) {
        if (!memoryStore[key]) memoryStore[key] = {};
        Object.assign(memoryStore[key], value);
        return Object.keys(value).length;
    },
    async hgetall(key: string) {
        return memoryStore[key] || null;
    },
    async hincrby(key: string, field: string, increment: number) {
        if (!memoryStore[key]) memoryStore[key] = {};
        const current = parseInt(memoryStore[key][field] || "0", 10);
        const newValue = current + increment;
        memoryStore[key][field] = newValue.toString();
        return newValue;
    },
    async del(key: string) {
        const existed = !!memoryStore[key];
        delete memoryStore[key];
        return existed ? 1 : 0;
    },
    async ping() {
        return "PONG";
    }
};

const isKvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const kv = (isKvConfigured ? vercelKv : mockKv) as typeof vercelKv;

export default kv;

import { headers } from "next/headers";

export async function getTimezone() {
    const headersList = await headers();
    return headersList.get("x-timezone") || "UTC";
}

export async function nowMs() {
    if (process.env.TEST_MODE === "1") {
        const headersList = await headers();
        const testNow = headersList.get("x-test-now-ms");
        if (testNow) {
            return parseInt(testNow, 10);
        }
    }
    return Date.now();
}

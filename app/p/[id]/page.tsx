// app/p/[id]/page.tsx
import kv from "@/lib/kv";
import { nowMs } from "@/lib/time";
import { notFound } from "next/navigation";

export default async function PastePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const key = `paste:${id}`;

  // Increment views first to be atomic
  const newViews = await kv.hincrby(key, "views", 1);
  const paste: any = await kv.hgetall(key);

  if (!paste || !paste.content) {
    if (newViews === 1) await kv.del(key);
    return notFound();
  }

  const createdAt = parseInt(paste.createdAt, 10);
  const ttlSeconds = paste.ttlSeconds ? parseInt(paste.ttlSeconds, 10) : null;
  const maxViews = paste.maxViews ? parseInt(paste.maxViews, 10) : null;

  const now = await nowMs();

  // Check TTL
  if (ttlSeconds && now > createdAt + ttlSeconds * 1000) {
    await kv.del(key);
    return notFound();
  }

  // Check View Limit
  if (maxViews && newViews > maxViews) {
    return notFound();
  }

  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {paste.content}
    </pre>
  );
}

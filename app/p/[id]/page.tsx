// app/p/[id]/page.tsx
import kv from "@/lib/kv";
import { nowMs } from "@/lib/time";
import { notFound } from "next/navigation";

export default async function PastePage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  const key = `paste:${id}`;

  const paste: any = await kv.hgetall(key);
  if (!paste || !paste.content) {
    notFound();
  }

  const newViews = await kv.hincrby(key, "views", 1);

  const createdAt = parseInt(paste.createdAt, 10);
  const ttlSeconds = paste.ttlSeconds ? parseInt(paste.ttlSeconds, 10) : null;
  const maxViews = paste.maxViews ? parseInt(paste.maxViews, 10) : null;

  const now = await nowMs();

  if (ttlSeconds && now > createdAt + ttlSeconds * 1000) {
    await kv.del(key);
    notFound();
  }

  if (maxViews && newViews > maxViews) {
    await kv.del(key);
    notFound();
  }

  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {paste.content}
    </pre>
  );
}
// app/api/pastes/[id]/route.ts
import kv from "@/lib/kv";
import { nowMs } from "@/lib/time";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = `paste:${id}`;

  // Increment views first to be atomic
  const newViews = await kv.hincrby(key, "views", 1);
  const paste: any = await kv.hgetall(key);

  if (!paste || !paste.content) {
    // If it was created by hincrby but has no content, clean up and 404
    if (newViews === 1) await kv.del(key);
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const createdAt = parseInt(paste.createdAt, 10);
  const ttlSeconds = paste.ttlSeconds ? parseInt(paste.ttlSeconds, 10) : null;
  const maxViews = paste.maxViews ? parseInt(paste.maxViews, 10) : null;

  const now = await nowMs();

  // Check TTL
  if (ttlSeconds && now > createdAt + ttlSeconds * 1000) {
    await kv.del(key);
    return Response.json({ error: "Expired" }, { status: 404 });
  }

  // Check View Limit
  if (maxViews && newViews > maxViews) {
    return Response.json({ error: "View limit exceeded" }, { status: 404 });
  }

  return Response.json({
    content: paste.content,
    remaining_views: maxViews ? Math.max(maxViews - newViews, 0) : null,
    expires_at: ttlSeconds
      ? new Date(createdAt + ttlSeconds * 1000).toISOString()
      : null
  });
}

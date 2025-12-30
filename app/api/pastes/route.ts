import kv from "@/lib/kv";
import { validatePaste } from "@/lib/validate";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const error = validatePaste(body);

    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const id = nanoid(8);
    const createdAt = Date.now();

    const paste = {
      content: body.content,
      createdAt: createdAt.toString(),
      ttlSeconds: body.ttl_seconds?.toString() || "",
      maxViews: body.max_views?.toString() || "",
      views: "0"
    };

    await kv.hset(`paste:${id}`, paste);

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const url = `${protocol}://${host}/p/${id}`;

    return Response.json({
      id,
      url
    });
  } catch (err) {
    console.error("Paste creation error:", err);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

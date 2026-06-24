import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIpHash, enforceRateLimit, limiters, badRequest, serverError } from "@/lib/request";
import { generateQ3Choices } from "@/core/ai";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  stream: z.string().max(50),
  subjects: z.array(z.string().max(200)).min(1).max(5),
});

export async function POST(req: NextRequest) {
  const ipHash = await clientIpHash(req);
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const { sessionId, stream, subjects } = parsed.data;
  const limited = await enforceRateLimit(limiters.chat, "q3choices", [sessionId, ipHash]);
  if (limited) return limited;

  try {
    const result = await generateQ3Choices({ stream, subjects });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return serverError("Could not generate interest choices");
  }
}

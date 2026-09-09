import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIpHash, enforceRateLimit, limiters, badRequest, serverError } from "@/lib/request";
import { generateQ4Choices } from "@/core/ai";
import { INTEREST_CLUSTERS, type InterestCluster } from "@/types/profile";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  stream: z.string().max(50),
  subjects: z.array(z.string().max(200)).max(5),
  primaryCluster: z.string().max(50),
  q3Activity: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const ipHash = await clientIpHash(req);
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const { sessionId, stream, subjects, primaryCluster, q3Activity } = parsed.data;
  if (!INTEREST_CLUSTERS.includes(primaryCluster as InterestCluster)) {
    return badRequest("Unknown interest cluster");
  }

  const limited = await enforceRateLimit(limiters.chat, "q4choices", [sessionId, ipHash]);
  if (limited) return limited;

  try {
    const result = await generateQ4Choices({ stream, subjects, primaryCluster, q3Activity });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return serverError("Could not generate follow-up choices");
  }
}

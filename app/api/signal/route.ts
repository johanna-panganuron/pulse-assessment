import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SignalType } from "@/lib/types";
import { signalLimiter } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES: SignalType[] = [
  "request",
  "accept",
  "decline",
  "offer",
  "answer",
  "ice",
  "end",
];

const MAX_PAYLOAD = 64 * 1024;

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1";
  const { isRateLimited } = signalLimiter.check(ip);
  if (isRateLimited) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const bodyObj = (body ?? {}) as Record<string, unknown>;
  const fromId = bodyObj.fromId;
  const toId = bodyObj.toId;
  const type = bodyObj.type;
  const payload = bodyObj.payload;

  if (typeof fromId !== "string" || typeof toId !== "string") {
    return Response.json({ error: "invalid ids" }, { status: 400 });
  }

  // Validate fromId length
  if (fromId.length < 8 || fromId.length > 64 || toId.length < 8 || toId.length > 64) {
    return Response.json({ error: "invalid id length" }, { status: 400 });
  }

  // Prevent self-signaling
  if (fromId === toId) {
    return Response.json({ error: "cannot signal self" }, { status: 400 });
  }

  if (typeof type !== "string" || !VALID_TYPES.includes(type as SignalType)) {
    return Response.json({ error: "invalid type" }, { status: 400 });
  }
  if (
    payload !== undefined &&
    payload !== null &&
    (typeof payload !== "string" || payload.length > MAX_PAYLOAD)
  ) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  // Verify fromId actually exists in presence table
  const sender = await prisma.presence.findUnique({
    where: { id: fromId },
    select: { id: true },
  });
  if (!sender) {
    return Response.json({ error: "sender not found" }, { status: 403 });
  }

  const signalType = type as SignalType;
  const payloadStr = typeof payload === "string" ? payload : null;

  if (signalType === "request") {
    const target = await prisma.presence.findUnique({
      where: { id: toId },
      select: { busy: true },
    });
    if (!target) {
      await sendDecline(toId, fromId);
      return Response.json({ ok: true, autoDeclined: true });
    }
    if (target.busy) {
      await sendDecline(toId, fromId);
      return Response.json({ ok: true, autoDeclined: true });
    }
  }

  if (signalType === "accept") {
    await prisma.presence.updateMany({
      where: { id: { in: [fromId, toId] } },
      data: { busy: true },
    });
  } else if (signalType === "decline" || signalType === "end") {
    await prisma.presence.updateMany({
      where: { id: { in: [fromId, toId] } },
      data: { busy: false },
    });
  }

  await prisma.signal.create({
    data: { fromId, toId, type: signalType, payload: payloadStr },
  });

  return Response.json({ ok: true });
}

async function sendDecline(targetId: string, initiatorId: string) {
  await prisma.signal.create({
    data: { fromId: targetId, toId: initiatorId, type: "decline", payload: null },
  });
}
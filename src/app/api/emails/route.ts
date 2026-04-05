// src/app/api/emails/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSessionFromRequest } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') || 'inbox';
  const q = searchParams.get('q');

  const where: Record<string, unknown> = { userId: session.userId };

  if (tab === 'starred') {
    where.starred = true;
  } else {
    where.tab = tab;
  }

  if (q) {
    where.OR = [
      { sender: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
    ];
  }

  const emails = await prisma.email.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ emails });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sender, senderEmail, subject, body, tab, sentAt } = await req.json();

  if (!subject || !body) {
    return NextResponse.json({ error: 'Subject and body required' }, { status: 400 });
  }

  const email = await prisma.email.create({
    data: {
      sender: sender || 'Me',
      senderEmail: senderEmail || 'me@nexus.local',
      subject,
      body,
      preview: body.slice(0, 100),
      tab: tab || 'inbox',
      unread: tab === 'inbox' ? true : false,
      starred: false,
      sentAt: sentAt || new Date().toLocaleTimeString(),
      userId: session.userId,
    },
  });

  return NextResponse.json({ email }, { status: 201 });
}
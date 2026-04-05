import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secret, email, password, name } = body;

    // 🔐 check setup secret
    if (secret !== process.env.SETUP_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    // 🚫 prevent duplicate admin
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return NextResponse.json(
        { error: "Setup already completed" },
        { status: 400 }
      );
    }

    // 🔒 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 create admin
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
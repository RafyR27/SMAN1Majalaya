import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

const editEmailSchema = z.object({
  newEmail: z.email().trim().toLowerCase(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Sesi Anda telah berakhir",
          data: null,
        },
        { status: 401 },
      );
    }

    const identifier = session.user.id;

    const body = await req.json();
    const validated = editEmailSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_DATA",
          message: "Data tidak sesuai",
          data: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { newEmail } = validated.data;

    if (newEmail === session.user.email) {
      return NextResponse.json(
        {
          status: 400,
          code: "SAME_EMAIL",
          message: "Email baru tidak boleh sama dengan email saat ini",
          data: null,
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: newEmail,
        NOT: {
          id: identifier,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 409,
          code: "EMAIL_ALREADY_EXISTS",
          message: "Email sudah digunakan oleh akun lain",
          data: null,
        },
        { status: 409 },
      );
    }

    const result = await auth.api.changeEmail({
      body: {
        newEmail,
      },
      headers: await headers(),
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_EMAIL",
        message: "Berhasil memperbarui email",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server",
        data: null,
      },
      { status: 500 },
    );
  }
}

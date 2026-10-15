import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

export const formSetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/[0-9]/)
      .regex(/^(?!.*\s).*$/),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
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

    const dateAgo = new Date();
    dateAgo.setDate(dateAgo.getDate() - 10);

    const user = await prisma.account.findFirst({
      where: {
        userId: identifier,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          code: "USER_NOT_FOUND",
          message: "Pengguna tidak ditemukan",
          data: null,
        },
        { status: 404 },
      );
    }

    const nextPasswordChange = new Date(user.updatedAt);
    nextPasswordChange.setDate(nextPasswordChange.getDate() + 10);

    if (user.updatedAt > dateAgo) {
      return NextResponse.json(
        {
          status: 400,
          code: "PASSWORD_CHANGE_LIMIT",
          message: `Password hanya bisa diganti setiap 10 hari sekali. Coba lagi pada ${nextPasswordChange.toLocaleString(
            "id-ID",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}.`,
          data: null,
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validated = formSetPasswordSchema.safeParse(body);

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

    const { password, oldPassword } = validated.data;

    if (password === oldPassword) {
      return NextResponse.json(
        {
          status: 400,
          code: "PASSWORD_NOT_CHANGED",
          message: "Kata sandi baru harus berbeda dari kata sandi saat ini",
          data: null,
        },
        { status: 400 },
      );
    }

    const data = await auth.api.changePassword({
      body: {
        newPassword: password,
        currentPassword: oldPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_CHANGE_PASSWORD",
        message: "Berhasil memperbarui kata sandi",
        data,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    if (error.body?.code === "INVALID_PASSWORD") {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_PASSWORD",
          message: "Kata sandi saat ini tidak valid",
          data: null,
        },
        { status: 400 },
      );
    }
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

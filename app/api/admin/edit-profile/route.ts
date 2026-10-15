import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

const formEditProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5)
    .regex(/^[a-zA-Z\s]+$/)
    .optional(),
  noHP: z
    .string()
    .trim()
    .min(1)
    .regex(/^08\d{8,12}$/)
    .optional(),
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
    const validated = formEditProfileSchema.safeParse(body);

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

    const result = await prisma.user.update({
      where: {
        id: identifier,
      },
      data: {
        ...(validated.data.name ? { name: validated.data.name } : {}),
        ...(validated.data.noHP ? { noHP: validated.data.noHP } : {}),
      },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_PROFILE",
        message: "Berhasil memperbarui profile",
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

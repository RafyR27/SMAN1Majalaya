import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { ProfileData } from "@/types/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const identifier = session.user.id;
    const role = session.user.role;

    if (role !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);

    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const search = searchParams.get("search")?.trim() ?? "";

    const where = {
      id: {
        not: identifier,
      },

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,

        skip: pageIndex * pageSize,
        take: pageSize,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          noHP: true,
          image: true,
          createdAt: true,
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    const data: ProfileData[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      noHP: user.noHP,
      image: user.image,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_GET_USERS",
        message: "Berhasil mengambil data user",
        data,
        pagination: {
          pageIndex,
          pageSize,
          totalUsers,
          totalPages: Math.ceil(totalUsers / pageSize),
        },
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

const formAddSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5)
    .regex(/^[a-zA-Z\s]+$/),
  email: z.email().trim().toLowerCase(),
  noHP: z
    .string()
    .trim()
    .min(1)
    .regex(/^08\d{8,12}$/),
  password: z
    .string()
    .min(8)
    .regex(/[0-9]/)
    .regex(/^(?!.*\s).*$/),
  image: z.string(),
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
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }
    const roleIdentifier = session.user.role;

    if (roleIdentifier !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = formAddSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_DATA",
          message: "Data tidak sesuai",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, noHP, password, image } = validated.data;

    const newUser = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        data: { noHP, image },
      },
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_USERS",
        message: "Berhasil membuat data user",
        data: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    if (
      error &&
      typeof error === "object" &&
      "body" in error &&
      error.body &&
      typeof error.body === "object" &&
      "code" in error.body &&
      error.body.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      return NextResponse.json(
        {
          status: 409,
          code: "USER_ALREADY_EXISTS",
          message: "Email sudah digunakan.",
          data: null,
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "Email atau nomor HP sudah digunakan.",
        },
        { status: 409 },
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

const formEditSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(5)
    .regex(/^[a-zA-Z\s]+$/),
  email: z.email().trim().toLowerCase(),
  noHP: z
    .string()
    .trim()
    .min(1)
    .regex(/^08\d{8,12}$/),
});

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const roleIdentifier = session.user.role;

    if (roleIdentifier !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = formEditSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_DATA",
          message: "Data tidak sesuai",
          errors: validated.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const { id, name, email, noHP } = validated.data;

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: "ID user wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const updated = await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data: { name, email, noHP },
      },
      headers: await headers(),
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_USER",
        message: "Berhasil mengedit data user",
        data: updated,
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

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const roleIdentifier = session.user.role;

    if (roleIdentifier !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: "ID user wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name } = body;

    const existUser = await prisma.user.findFirst({
      where: {
        id: idParam,
        name: name,
      },
      select: {
        id: true,
      },
    });

    if (!existUser) {
      return NextResponse.json(
        {
          status: 404,
          code: "USER_NOT_FOUND",
          message: "User tidak ditemukan",
          data: null,
        },
        { status: 404 },
      );
    }
 
    if (existUser.id === session.user.id) {
      return NextResponse.json(
        {
          status: 400,
          code: "CANNOT_DELETE_SELF",
          message: "Tidak dapat menghapus akun sendiri.",
          data: null,
        },
        { status: 400 },
      );
    }

    const deletedUser = await auth.api.removeUser({
      body: {
        userId: idParam,
      },
      headers: await headers(),
    });

  

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_USER",
        message: "Berhasil menghapus user",
        data: deletedUser,
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

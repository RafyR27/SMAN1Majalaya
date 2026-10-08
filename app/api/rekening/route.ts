import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
      ...(search && {
        OR: [
          {
            kodeRekening: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [rekeningList, totalRekening] = await prisma.$transaction([
      prisma.rekening.findMany({
        where,

        skip: pageIndex * pageSize,
        take: pageSize,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          kodeRekening: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.rekening.count({
        where,
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_GET_REKENING_CODE",
        message: "Berhasil mengambil data rekening",
        data: rekeningList,
        pagination: {
          pageIndex,
          pageSize,
          totalRekening,
          totalPages: Math.ceil(totalRekening / pageSize),
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

const rekeningAddSchema = z.object({
  kodeRekening: z.string().trim().min(3, "Kode rekening minimal 3 karakter"),
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
    const validated = rekeningAddSchema.safeParse(body);

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

    const { kodeRekening } = validated.data;

    const exist = await prisma.rekening.findFirst({
      where: {
        kodeRekening: kodeRekening,
      },
      select: {
        id: true,
      },
    });

    if (exist) {
      return NextResponse.json(
        {
          status: 400,
          code: "DATA_ALREADY_EXIST",
          message: `Kode Rekening dengan nomor ${kodeRekening} sudah ada`,
          data: null,
        },
        { status: 400 },
      );
    }

    const rekening = await prisma.rekening.create({
      data: {
        kodeRekening,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_REKENING_CODE",
        message: "Berhasil membuat data kode rekening",
        data: rekening,
      },
      { status: 201 },
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

const rekeningEditSchema = z.object({
  id: z.string().min(1, "ID rekening wajib diisi"),
  kodeRekening: z.string().trim().min(3, "Kode rekening minimal 3 karakter"),
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
    const validated = rekeningEditSchema.safeParse(body);

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

    const { id, kodeRekening } = validated.data;

    const exist = await prisma.rekening.findFirst({
      where: {
        kodeRekening: kodeRekening,
      },
      select: {
        id: true,
      },
    });

    if (exist) {
      return NextResponse.json(
        {
          status: 400,
          code: "DATA_ALREADY_EXIST",
          message: `Kode Rekening dengan nomor ${kodeRekening} sudah ada`,
          data: null,
        },
        { status: 400 },
      );
    }

    const rekening = await prisma.rekening.update({
      where: { id },
      data: { kodeRekening },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_REKENING",
        message: "Berhasil mengubah data kode rekening",
        data: rekening,
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
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: "ID rekening wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const existRekening = await prisma.rekening.findUnique({
      where: { id: idParam },
      select: {
        id: true,
        _count: {
          select: {
            barang: true,
          },
        },
      },
    });

    if (!existRekening) {
      return NextResponse.json(
        {
          status: 404,
          code: "REKENING_NOT_FOUND",
          message: "Kode rekening tidak ditemukan.",
          data: null,
        },
        { status: 404 },
      );
    }

    if (existRekening._count.barang > 0) {
      return NextResponse.json(
        {
          status: 400,
          code: "REKENING_HAS_BARANG",
          message:
            "Kode rekening tidak dapat dihapus karena masih digunakan oleh data barang.",
          data: null,
        },
        { status: 400 },
      );
    }

    await prisma.rekening.delete({
      where: { id: idParam },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_REKENING",
        message: "Berhasil menghapus kode rekening",
        data: null,
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

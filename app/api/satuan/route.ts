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
            satuan: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [satuanList, totalSatuan] = await prisma.$transaction([
      prisma.satuan.findMany({
        where,

        skip: pageIndex * pageSize,
        take: pageSize,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          satuan: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.satuan.count({
        where,
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_GET_SATUAN",
        message: "Berhasil mengambil data satuan",
        data: satuanList,
        pagination: {
          pageIndex,
          pageSize,
          totalSatuan,
          totalPages: Math.ceil(totalSatuan / pageSize),
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

const satuanAddSchema = z.object({
  satuan: z.string().trim().min(2, "Nama satuan minimal 2 karakter"),
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
    const validated = satuanAddSchema.safeParse(body);

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

    const { satuan } = validated.data;

    const exist = await prisma.satuan.findFirst({
      where: {
        satuan: satuan,
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
          message: `Satuan dengan nama ${satuan} sudah ada`,
          data: null,
        },
        { status: 400 },
      );
    }

    const result = await prisma.satuan.create({
      data: {
        satuan,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_SATUAN",
        message: "Berhasil membuat data satuan",
        data: result,
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

const satuanEditSchema = z.object({
  id: z.string().min(1, "ID satuan wajib diisi"),
  satuan: z.string().trim().min(2, "Nama satuan minimal 2 karakter"),
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
    const validated = satuanEditSchema.safeParse(body);

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

    const { id, satuan } = validated.data;

    const exist = await prisma.satuan.findFirst({
      where: {
        satuan: satuan,
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
          message: `Satuan dengan nama ${satuan} sudah ada`,
          data: null,
        },
        { status: 400 },
      );
    }

    const result = await prisma.satuan.update({
      where: { id },
      data: { satuan },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_SATUAN",
        message: "Berhasil mengubah data satuan",
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
          message: "ID satuan wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const existSatuan = await prisma.satuan.findUnique({
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

    if (!existSatuan) {
      return NextResponse.json(
        {
          status: 404,
          code: "SATUAN_NOT_FOUND",
          message: "Satuan tidak ditemukan.",
          data: null,
        },
        { status: 404 },
      );
    }

    if (existSatuan._count.barang > 0) {
      return NextResponse.json(
        {
          status: 400,
          code: "SATUAN_HAS_BARANG",
          message:
            "Satuan tidak dapat dihapus karena masih digunakan oleh data barang.",
          data: null,
        },
        { status: 400 },
      );
    }

    await prisma.satuan.delete({
      where: { id: idParam },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_SATUAN",
        message: "Berhasil menghapus satuan",
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

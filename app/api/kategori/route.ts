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

    const all = searchParams.get("all") === "true";
    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const search = searchParams.get("search")?.trim() ?? "";

    if (all) {
      const kategoriList = await prisma.kategori.findMany({
        orderBy: { kategori: "asc" },
        select: {
          id: true,
          kategori: true,
        },
      });
      return NextResponse.json(
        {
          status: 200,
          message: "Berhasil mengambil semua data kategori",
          data: kategoriList,
        },
        { status: 200 },
      );
    }

    const where = {
      ...(search && {
        OR: [
          {
            kategori: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [kategoriList, totalKategori] = await prisma.$transaction([
      prisma.kategori.findMany({
        where,

        skip: pageIndex * pageSize,
        take: pageSize,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          kategori: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.kategori.count({
        where,
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_GET_KATEGORI",
        message: "Berhasil mengambil data kategori",
        data: kategoriList,
        pagination: {
          pageIndex,
          pageSize,
          totalKategori,
          totalPages: Math.ceil(totalKategori / pageSize),
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

const kategoriAddSchema = z.object({
  kategori: z.string().trim().min(3, "Nama kategori minimal 3 karakter"),
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
    const validated = kategoriAddSchema.safeParse(body);

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

    const { kategori } = validated.data;

    const exist = await prisma.kategori.findFirst({
      where: {
        kategori: kategori,
      },
      select: {
        id: true,
      },
    });

    if(exist){
      return NextResponse.json(
        {
          status: 400,
          code: "DATA_ALREADY_EXIST",
          message: `Kategori dengan nama ${kategori} sudah ada`,
          data: null
        },
        { status: 400 },
      );
    }

    const result = await prisma.kategori.create({
      data: {
        kategori,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_KATEGORI",
        message: "Berhasil membuat data kategori",
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

const kategoriEditSchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
  kategori: z.string().trim().min(3, "Nama kategori minimal 3 karakter"),
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
    const validated = kategoriEditSchema.safeParse(body);

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

    const { id, kategori } = validated.data;

    const exist = await prisma.kategori.findFirst({
      where: {
        kategori: kategori,
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
          message: `Kategori dengan nama ${kategori} sudah ada`,
          data: null,
        },
        { status: 400 },
      );
    }

    const result = await prisma.kategori.update({
      where: { id },
      data: { kategori },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_KATEGORI",
        message: "Berhasil mengubah data kategori",
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
          message: "ID kategori wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const existKategori = await prisma.kategori.findUnique({
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

    if (!existKategori) {
      return NextResponse.json(
        {
          status: 404,
          code: "KATEGORI_NOT_FOUND",
          message: "Kategori tidak ditemukan.",
          data: null,
        },
        { status: 404 },
      );
    }

    if (existKategori._count.barang > 0) {
      return NextResponse.json(
        {
          status: 400,
          code: "KATEGORI_HAS_BARANG",
          message:
            "Kategori tidak dapat dihapus karena masih digunakan oleh data barang.",
          data: null,
        },
        { status: 400 },
      );
    }

    await prisma.kategori.delete({
      where: { id: idParam },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_KATEGORI",
        message: "Berhasil menghapus kategori",
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

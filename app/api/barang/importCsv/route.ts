import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

function parseDate(dateVal: string): Date {
  const value = dateVal.trim();

  const [day, month, year] = value.split(/[/-]/).map(Number);

  if (!day || !month || !year) {
    throw new Error(`Format tanggal tidak valid: ${dateVal}`);
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Tanggal tidak valid: ${dateVal}`);
  }

  return date;
}

const barangAddSchema = z.object({
  namaBarang: z.string().trim().min(3),
  kodeRekening: z.string().min(1),
  kategori: z.string().min(1),
  satuan: z.string().min(1),
  merk: z.string().trim().optional(),
  sumber: z.string().trim().optional(),
  harga: z.number().min(0),
  tanggal: z.string().min(1),
});

const barangBulkAddSchema = z.object({
  items: z.array(barangAddSchema).min(1, "Minimal harus ada satu barang"),
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
          message:
            "Akses ditolak. Hanya admin yang dapat mengimpor data barang.",
          data: null,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = barangBulkAddSchema.safeParse(body);

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

    const { items } = validated.data;

    const newItems = items.map((item) => {
      return {
        ...item,
        tanggal: parseDate(item.tanggal),
      };
    });

    const dataBarang = [];

    for (const [index, item] of newItems.entries()) {
      const [barang, rekening, kategori, satuan] = await Promise.all([
        prisma.barang.findFirst({
          where: {
            namaBarang: item.namaBarang,
            rekening: {
              kodeRekening: item.kodeRekening
            },
            kategori: {
              kategori: item.kategori
            }
          },

          select: {
            namaBarang: true,
            kategori: true,
            rekening: true,
          }
        }),
        prisma.rekening.findFirst({
          where: {
            kodeRekening: item.kodeRekening,
          },
        }),
        prisma.kategori.findFirst({
          where: {
            kategori: item.kategori,
          },
        }),
        prisma.satuan.findFirst({
          where: {
            satuan: item.satuan,
          },
        }),
      ]);

      if (barang) {
        return NextResponse.json(
          {
            status: 400,
            code: "BARANG_IS_EXIST",
            message: `${barang.namaBarang} sudah ada pada kode rekening "${barang.rekening.kodeRekening}" dan kategori "${barang.kategori.kategori}"`,
            data: null,
          },
          { status: 400 },
        );
      }

      if (!rekening) {
        return NextResponse.json(
          {
            status: 400,
            code: "REKENING_NOT_FOUND",
            message: "Kode rekening tidak ditemukan",
            data: null,
          },
          { status: 400 },
        );
      }

      if (!kategori) {
        return NextResponse.json(
          {
            status: 400,
            code: "KATEGORI_NOT_FOUND",
            message: "Kategori tidak ditemukan",
            data: null,
          },
          { status: 400 },
        );
      }

      if (!satuan) {
        return NextResponse.json(
          {
            status: 400,
            code: "SATUAN_NOT_FOUND",
            message: `Satuan dengan nama ${item.satuan} tidak ditemukan`,
            data: null,
          },
          { status: 400 },
        );
      }

      dataBarang.push({
        namaBarang: item.namaBarang,
        rekeningId: rekening.id,
        kategoriId: kategori.id,
        satuanId: satuan.id,
        merk: item.merk,
        sumber: item.sumber,
        harga: item.harga,
        tanggal: item.tanggal,
      });
    }

    const barang = await prisma.barang.createMany({
      data: dataBarang,
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_IMPORT_BARANG",
        message: "Berhasil mengimpor data barang",
        data: barang,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error import CSV barang:", error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server saat mengimpor barang",
        data: null,
      },
      { status: 500 },
    );
  }
}

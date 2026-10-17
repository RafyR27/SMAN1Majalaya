import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/gedung-sekolah-new.jpeg"
          alt="Gedung SMAN 1 Majalaya"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold leading-tight text-background">
              Penatausahaan Sarana Prasarana SMAN 1 Majalaya
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-background/75">
              Perum Citra Kebun Mas , Kec. Majalaya, Kab. Karawang, Prov. Jawa
              Barat
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-8 lg:p-10 bg-background">
        {/* Header Pojok Kiri Atas (Logo + Nama Sekolah) */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo SMAN 1 Majalaya"
            width={44}
            height={44}
            priority
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-foreground">
              SMAN 1 Majalaya
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
              Kabupaten Karawang
            </span>
          </div>
        </div>

        {/* Form Login */}
        <div className="w-full max-w-lg lg:max-w-sm mx-auto my-auto flex flex-col justify-center items-center gap-5 py-8">
          <div className="space-y-1 text-center">
            <h1 className="font-bold text-xl sm:text-2xl text-foreground">Masuk</h1>
            <p className="text-muted-foreground text-sm max-w-80 lg:max-w-full">
              Masukkan email dan password anda
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

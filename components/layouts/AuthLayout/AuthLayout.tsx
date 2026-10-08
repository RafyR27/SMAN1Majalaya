import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* <Image
          src="/cleanup.webp"
          alt="cleanup"
          fill
          priority
          className="object-cover"
        /> */}

        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold leading-tight text-background">
              SMAN 1 MAJALAYA
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-background/75">
              Perum Citra Kebun Mas , Kec. Majalaya, Kab. Karawang, Prov. Jawa
              Barat
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center px-5 lg:px-10">
        <div className="w-full h-auto max-w-lg lg:max-w-sm flex flex-col justify-center items-center gap-5 py-10">
          <div className="space-y-1 text-center">
            <h1 className="font-bold text-[1.1rem]">Masuk</h1>
            <p className="text-muted-foreground text-[0.9rem] lg:text-[0.9rem] max-w-80 lg:max-w-full">
              Masukkan email dan password anda
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

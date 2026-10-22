"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="relative flex flex-1 min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[28rem] sm:w-[28rem]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        {/* School Branding Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-4 py-2 shadow-xs backdrop-blur-md">
          <Image
            src="/logo.png"
            alt="Logo SMAN 1 Majalaya"
            width={24}
            height={24}
            priority
            className="object-contain"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              SMAN 1 Majalaya
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Sistem Sarana Prasarana
            </span>
          </div>
        </div>

        {/* 404 Centerpiece */}
        <div className="relative flex items-center justify-center my-2">
          {/* Subtle Ambient Glow behind 404 */}
          <span
            className="absolute select-none text-8xl font-black tracking-tighter text-primary/15 blur-2xl sm:text-9xl md:text-[11rem]"
            aria-hidden="true"
          >
            404
          </span>
          <h1 className="relative select-none text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 leading-none drop-shadow-xs sm:text-9xl md:text-[11rem]">
            404
          </h1>
        </div>

        {/* Informative Content */}
        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Halaman Tidak Ditemukan
          </h2>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base leading-relaxed">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau
            tautan yang Anda masukkan salah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            onClick={handleGoBack}
            size="lg"
            className="group h-11 w-full gap-2 px-6 text-sm font-semibold shadow-sm hover:shadow transition-all sm:w-auto cursor-pointer"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Kembali ke Halaman Sebelumnya
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="group h-11 w-full gap-2 px-5 text-sm font-medium hover:bg-muted/80 transition-all sm:w-auto cursor-pointer"
          >
            <Home className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            Ke Halaman Utama
          </Button>
        </div>
      </div>
    </main>
  );
}

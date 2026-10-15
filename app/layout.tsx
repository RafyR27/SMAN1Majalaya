import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TanStackProvider } from "@/providers/tanstack-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Penatausahaan Sarana Prasarana | SMAN 1 Majalaya",
  description:
    "Penatausahaan Sarana Prasarana yang dikelola oleh SMAN 1 Majalaya",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TanStackProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </TanStackProvider>
        <Toaster />
      </body>
    </html>
  );
}

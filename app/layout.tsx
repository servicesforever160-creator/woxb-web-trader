import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Toaster } from "@/src/components/ui/toast";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-playfair-display'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-noto-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} WebTrader`,
  description: `${process.env.NEXT_PUBLIC_APP_NAME} trading terminal`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, playfairDisplayHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}

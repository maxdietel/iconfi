import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
import Image from "next/image";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "iConFi",
  description: "Bestehe deine TK-Prüfung mit System.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    images: ["/logo.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-3 items-center font-semibold">
                  <Link href={"/"} className="flex items-center">
                    <Image
                      src="/logo.png"
                      alt="iConFi Logo"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </Link>
                </div>
                <AuthButton />
              </div>
            </nav>

            <div className="flex grow flex-col max-w-5xl mx-auto w-full px-5 py-12">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

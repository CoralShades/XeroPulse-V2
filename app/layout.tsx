import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "XeroPulse - Financial Intelligence Platform",
    template: "%s | XeroPulse",
  },
  description: "Transform your Xero accounting data into actionable insights with role-based dashboards and intelligent analytics.",
  keywords: ["xero", "accounting", "business intelligence", "dashboards", "financial analytics"],
  authors: [{ name: "XeroPulse Team" }],
  creator: "XeroPulse",
  publisher: "XeroPulse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "XeroPulse",
    title: "XeroPulse - Financial Intelligence Platform",
    description: "Transform your Xero accounting data into actionable insights",
  },
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

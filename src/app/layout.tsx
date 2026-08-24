import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardápio Digital",
  description: "Cardápio digital para lojas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

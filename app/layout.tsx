import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "AI Image Detector — Real vs AI Generated",
    description:
        "Deteksi apakah gambar dibuat oleh AI atau merupakan gambar nyata menggunakan Convolutional Neural Network (CNN).",
    keywords: ["AI detector", "image classifier", "CNN", "deep learning", "AI generated"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body className={`${inter.variable} antialiased`}>{children}</body>
        </html>
    );
}

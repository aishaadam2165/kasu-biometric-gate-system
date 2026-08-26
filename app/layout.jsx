import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "KASU Biometric Gate Access",
  description:
    "Secure Hybrid Multi-Biometric Authentication System for Student Campus Gate Access Control — Kaduna State University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

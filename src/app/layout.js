import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { ThemeProvider } from "./Theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HeadlineHero - AI-Powered Newsletter Headlines",
  description:
    "Generate compelling newsletter headlines that drive engagement and improve open rates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              toastOptions={{
                className: " font-inter",
                duration: 3000,
              }}
            />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

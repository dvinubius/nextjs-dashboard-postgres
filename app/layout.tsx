import '@/app/ui/global.css';
import { inter } from './ui/fonts';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

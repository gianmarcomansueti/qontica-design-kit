import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';

import { voceAgenteAbilitata } from '@/lib/agent-gateway/voce-agente';
import { I18N_STORAGE_KEY, resolveInitialLocale } from '@/lib/i18n';
import { ricercaBilanciAbilitata } from '@/lib/infocamere/ricerca-bilanci';
import { isProductionPresenceEnabled } from '@/lib/services/active-users-service';

import { Providers } from '@/components/providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://template.Qontica.ai';
const ogImage = `${baseUrl}/opengraph-image.png`;
const ogImageSquare = `${baseUrl}/og-image-square.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | Qontica',
    default: 'Qontica',
  },
  description: 'Production-ready Next.js template with auth, billing, database, and deployment.',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Better Auth',
    'PostgreSQL',
    'Drizzle ORM',
    'Vercel',
    'Starter Template',
    'Boilerplate',
  ],
  authors: [{ name: 'Qontica' }],
  creator: 'Qontica',
  publisher: 'Qontica',
  openGraph: {
    title: 'Qontica - Production-Ready Next.js Starter',
    description: 'Production-ready Next.js template with auth, billing, database, and deployment.',
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Qontica - Production-Ready Next.js Starter',
      },
      {
        url: ogImageSquare,
        width: 500,
        height: 500,
        alt: 'Qontica - Production-Ready Next.js Starter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qontica - Production-Ready Next.js Starter',
    description: 'Production-ready Next.js template with auth, billing, database, and deployment.',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Qontica - Production-Ready Next.js Starter',
      },
    ],
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicon.png',
    },
    {
      rel: 'shortcut icon',
      url: '/favicon.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicon.png',
    },
  ],
  verification: {
    // Add when you have these set up:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = resolveInitialLocale(cookieStore.get(I18N_STORAGE_KEY)?.value);
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleHost = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST;
  // Il rilascio della voce «Agent» si legge QUI — il root layout è l'unico server
  // component sopra la sidebar — e viaggia verso la nav client via Providers →
  // VoceAgenteProvider. Fail-loud: un valore ignoto ferma il rendering, non
  // decide in silenzio che cosa si vede nel menu.
  const voceAgente = voceAgenteAbilitata();
  const ricercaBilanci = ricercaBilanciAbilitata();

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {plausibleDomain && plausibleHost && (
          <Script
            defer
            data-domain={plausibleDomain}
            src={`${plausibleHost}/js/script.js`}
            strategy="afterInteractive"
          />
        )}
        <Providers
          initialLocale={initialLocale}
          voceAgenteAbilitata={voceAgente}
          ricercaBilanciAbilitata={ricercaBilanci}
          presenzaAbilitata={isProductionPresenceEnabled()}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}

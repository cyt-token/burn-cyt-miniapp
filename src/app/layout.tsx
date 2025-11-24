import type { Metadata } from 'next';
import '~/app/globals.css';
import { Providers } from '~/app/providers';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:miniapp"
          content='{
            "id": "burn-cyt-miniapp",
            "actionUrl": "https://burn-cyt-miniapp.vercel.app",
            "splashImageUrl": "https://burn-cyt-miniapp.vercel.app/splash.png",
            "splashTitle": "Change Your Token",
            "splashDescription": "Burn your token & get CYT automatically",
            "defaultChainId": "8453"
          }'
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Cementerio de Secretos - Comparte Secretos Anónimos</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Comparte tus secretos anónimos con total privacidad. Reacciones, respuestas, trending, búsqueda avanzada y más. 100% seguro." />
        <meta name="keywords" content="secretos anónimos, confesiones, compartir secretos, privado, anónimo, historias" />
        <meta name="author" content="Cementerio de Secretos" />
        <meta name="theme-color" content="#000000" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://cementerio-de-secretos-y-confesiones.vercel.app/" />
        
        {/* Open Graph */}
        <meta property="og:site_name" content="Cementerio de Secretos" />
        <meta property="og:title" content="⚰️ Cementerio de Secretos - Comparte Secretos Anónimos" />
        <meta property="og:description" content="Plataforma para compartir tus secretos anónimamente con total privacidad. Reacciones, respuestas, trending y búsqueda." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cementerio-de-secretos-y-confesiones.vercel.app/" />
        <meta property="og:image" content="https://cementerio-de-secretos-y-confesiones.vercel.app/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter Card */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="⚰️ Cementerio de Secretos" />
        <meta property="twitter:description" content="Comparte tus secretos anónimamente - 100% privado, respuestas, 7 reacciones y más" />
        <meta property="twitter:image" content="https://cementerio-de-secretos-y-confesiones.vercel.app/api/og" />
        
        {/* Schema.org */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Cementerio de Secretos',
          'description': 'Plataforma para compartir secretos anónimos',
          'url': 'https://cementerio-de-secretos-y-confesiones.vercel.app',
          'applicationCategory': 'SocialNetworking',
          'isAccessibleForFree': true,
          'offers': {
            '@type': 'Offer',
            'price': '0'
          }
        })}} />
        
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                // Christmas mode is ENABLED by default (only disabled if explicitly set to 'false')
                const christmasMode = localStorage.getItem('christmas_mode') !== 'false';
                document.documentElement.setAttribute('data-christmas', christmasMode ? 'true' : 'false');
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

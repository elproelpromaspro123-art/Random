import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Cementerio de Secretos v2.3 - Navidad 2025</title>
        <meta charSet="utf-8" />
        <meta name="description" content="Cementerio de Secretos v2.3 - UI/UX Móvil Optimizada y Navidad Mejorada" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:title" content="⚰️ Cementerio de Secretos v2.3" />
        <meta property="og:description" content="Comparte tus secretos anónimamente - 100% privado, respuestas, 7 reacciones, trending, búsqueda avanzada y más" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cementerio-de-secretos-y-confesiones.vercel.app/" />
        <meta property="og:image" content="https://cementerio-de-secretos-y-confesiones.vercel.app/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="⚰️ Cementerio de Secretos v2.3" />
        <meta property="twitter:description" content="Comparte tus secretos anónimamente - 100% privado, respuestas, 7 reacciones y más" />
        <meta property="twitter:image" content="https://cementerio-de-secretos-y-confesiones.vercel.app/api/og" />
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

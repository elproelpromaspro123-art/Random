import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Cementerio de Secretos v2.2 - Navidad 2025</title>
        <meta charSet="utf-8" />
        <meta name="description" content="Cementerio de Secretos v2.2 - Seguridad, Optimización y Decoraciones Navideñas" />
        <meta name="theme-color" content="#000000" />
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

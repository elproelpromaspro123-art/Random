import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            backgroundColor: '#00ff41',
            borderRadius: '50%',
            opacity: 0.08,
            top: '30px',
            left: '30px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            backgroundColor: '#ff00ff',
            borderRadius: '50%',
            opacity: 0.08,
            bottom: '-50px',
            right: '-50px',
          }}
        />

        {/* Content wrapper */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            textAlign: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Coffin emoji */}
          <div style={{ fontSize: '100px', marginBottom: '15px', lineHeight: '1' }}>⚰️</div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '66px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 10px 0',
              letterSpacing: '1px',
              lineHeight: '1.2',
            }}
          >
            CEMENTERIO DE<br />SECRETOS
          </h1>

          {/* Version and subtitle */}
          <h2
            style={{
              fontSize: '42px',
              color: '#00ff41',
              fontWeight: '600',
              margin: '10px 0 20px 0',
              lineHeight: '1.2',
            }}
          >
            v2.3 - Comparte Anónimamente
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '32px',
              color: '#cccccc',
              margin: '0 0 25px 0',
              maxWidth: '900px',
              lineHeight: '1.3',
            }}
          >
            100% Privado • Respuestas • 7 Reacciones
          </p>

          {/* Icons line */}
          <div style={{ fontSize: '48px', marginBottom: '25px', letterSpacing: '16px', lineHeight: '1' }}>
            🔒 💬 🔥 ❤️ 🎨 ⭐
          </div>

          {/* Bottom tagline */}
          <p
            style={{
              fontSize: '24px',
              color: '#888888',
              margin: 0,
              fontStyle: 'italic',
              lineHeight: '1.3',
            }}
          >
            Donde los secretos encuentran paz eterna
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

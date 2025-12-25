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
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            backgroundColor: '#00ff41',
            borderRadius: '50%',
            opacity: 0.1,
            top: '50px',
            left: '50px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            backgroundColor: '#ff00ff',
            borderRadius: '50%',
            opacity: 0.1,
            bottom: '0px',
            right: '0px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          {/* Coffin emoji */}
          <div style={{ fontSize: '120px', marginBottom: '30px' }}>⚰️</div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}
          >
            CEMENTERIO DE SECRETOS
          </h1>

          {/* Version and subtitle */}
          <h2
            style={{
              fontSize: '48px',
              color: '#00ff41',
              fontWeight: '600',
              margin: '0 0 30px 0',
            }}
          >
            v2.3 - Comparte Anónimamente
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '36px',
              color: '#cccccc',
              margin: '0 0 40px 0',
              maxWidth: '800px',
            }}
          >
            100% Privado • Respuestas • 7 Reacciones
          </p>

          {/* Icons line */}
          <div style={{ fontSize: '56px', marginBottom: '40px', letterSpacing: '20px' }}>
            🔒 💬 🔥 ❤️ 🎨 ⭐
          </div>

          {/* Bottom tagline */}
          <p
            style={{
              fontSize: '28px',
              color: '#888888',
              margin: 0,
              fontStyle: 'italic',
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

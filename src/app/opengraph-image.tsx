import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Piraí — Tu copiloto para conseguir trabajo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A2332 0%, #1e3a2f 60%, #004d30 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(27,205,209,0.15)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,168,107,0.2)', display: 'flex' }} />

        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '8px 20px', marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1BCDD1', display: 'flex' }} />
          <span style={{ color: '#1BCDD1', fontSize: 18, fontWeight: 600 }}>pirai.es</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', letterSpacing: -2 }}>Tu copiloto para</span>
          <span style={{ fontSize: 72, fontWeight: 800, color: '#1BCDD1', letterSpacing: -2 }}>conseguir trabajo</span>
        </div>

        {/* Subtitle */}
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 26, marginTop: 24, maxWidth: 700, textAlign: 'center' }}>
          CRM laboral · Acciones diarias con IA · Marca personal
        </p>

        {/* Bottom */}
        <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#00A86B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>P</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 700 }}>Piraí</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

'use client';

import { useEffect, useState } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/es/app/pira%C3%AD/id6761818966?l=en-GB';

export default function AppRedirect() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);

    if (ios) {
      setIsIOS(true);
      window.location.href = APP_STORE_URL;
    } else if (android) {
      window.location.replace('https://piraiapp.com');
    } else {
      window.location.replace('https://pirai.es/dashboard');
    }
  }, []);

  if (!isIOS) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
        Redirigiendo...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', gap: '16px', padding: '24px', textAlign: 'center' }}>
      <img src="/pirai-logo-color.png" alt="Piraí" style={{ width: '120px', marginBottom: '8px' }} />
      <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Si no se abrió la App Store automáticamente, tocá el botón:</p>
      <a
        href={APP_STORE_URL}
        style={{ display: 'inline-block', background: '#00A86B', color: '#fff', fontWeight: 'bold', fontSize: '16px', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }}
      >
        Abrir en App Store
      </a>
    </div>
  );
}

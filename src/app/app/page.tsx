'use client';

import { useEffect } from 'react';

export default function AppRedirect() {
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
    window.location.replace(isMobile ? 'https://piraiapp.com' : 'https://pirai.es/dashboard');
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
      Redirigiendo...
    </div>
  );
}

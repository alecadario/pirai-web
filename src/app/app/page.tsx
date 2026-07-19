'use client';

import { useEffect } from 'react';

export default function AppRedirect() {
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.replace('https://apps.apple.com/es/app/pira%C3%AD/id6761818966?l=en-GB');
    } else if (isAndroid) {
      window.location.replace('https://piraiapp.com');
    } else {
      window.location.replace('https://pirai.es/dashboard');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
      Redirigiendo...
    </div>
  );
}

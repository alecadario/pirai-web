// PDF generation — mirrors the mobile app layout exactly

export const PDF_THEMES: Record<string, { accent: [number,number,number]; leftBg: [number,number,number] }> = {
  esmeralda: { accent: [0, 168, 107],  leftBg: [230, 247, 240] },
  turquesa:  { accent: [27, 205, 209], leftBg: [231, 250, 251] },
  oscuro:    { accent: [45, 55, 72],   leftBg: [242, 244, 247] },
  blanco:    { accent: [0, 168, 107],  leftBg: [255, 255, 255] },
};

export function pdfSafe(str: unknown): string {
  if (!str) return '';
  return String(str)
    .replace(/[''ʼ]/g, "'")
    .replace(/[""«»]/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, ' - ')
    .replace(/…/g, '...')
    .replace(/•/g, '*')
    .replace(/[^\x20-\xFF]/g, '');
}

interface CvGenResult {
  cv?: Record<string, unknown>;
  coverLetter?: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userLinkedin?: string | null;
}

interface CvGenForm {
  rol: string;
  empresa: string;
  idioma: string;
  genero: string;
  colorTheme: string;
}

export async function cropImageToCircle(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = Math.min(img.width, img.height, 300);
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx.drawImage(img, ox, oy, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCoverLetterOnDoc(doc: any, { cvGenResult, cvGenForm, ac, name }: {
  cvGenResult: CvGenResult;
  cvGenForm: { rol: string; empresa: string; idioma: string };
  ac: [number,number,number];
  name: string;
}) {
  const W = 210, mx = 20, mxR = W - 20, tw = W - mx * 2;
  const txt = (s: unknown) => pdfSafe(s);
  const split = (s: unknown, w: number) => doc.splitTextToSize(pdfSafe(s), w);
  const H = 297;
  const chkCL = (yy: number) => { if (yy > H - 18) { doc.addPage(); return 22; } return yy; };

  // header band
  doc.setFillColor(...ac);
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(txt(name).toUpperCase(), mx, 12);

  const headerContact = [cvGenResult.userEmail, cvGenResult.userPhone].filter(Boolean).join('   ');
  if (headerContact) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(pdfSafe(headerContact), mxR, 12, { align: 'right' });
  }

  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...ac);
  split(cvGenForm.rol, tw).forEach((l: string) => { doc.text(l, mx, y); y += 6.5; });

  if (cvGenForm.empresa) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(txt(cvGenForm.empresa), mx, y);
    y += 5;
  }

  y += 2;
  doc.setDrawColor(...ac);
  doc.setLineWidth(0.5);
  doc.line(mx, y, mxR, y);
  y += 10;

  const clLines = (String(cvGenResult.coverLetter || '')).split('\n').map((l: string) => pdfSafe(l));
  doc.setTextColor(38, 38, 38);
  let prevWasEmpty = false;
  for (let ci = 0; ci < clLines.length; ci++) {
    y = chkCL(y);
    const line = clLines[ci].trim();
    if (!line) { if (!prevWasEmpty) y += 5; prevWasEmpty = true; continue; }
    prevWasEmpty = false;
    const isSalutation = ci === 0 || (ci < 4 && clLines.slice(0, ci).every((l: string) => !l.trim()));
    const isClosing = /^(atentamente|best regards|atenciosamente|saludos|regards)/i.test(line);
    doc.setFont('helvetica', (isSalutation || isClosing) ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    split(line, tw).forEach((wl: string) => { y = chkCL(y); doc.text(wl, mx, y); y += 6; });
  }
}

export async function generateCvPDF({
  cvGenResult, cvGenForm, isCV, cvPhoto, returnBase64 = false, combined = false,
}: {
  cvGenResult: CvGenResult;
  cvGenForm: CvGenForm;
  isCV: boolean;
  cvPhoto?: string | null;
  returnBase64?: boolean;
  combined?: boolean;
}): Promise<string | void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const theme = PDF_THEMES[cvGenForm.colorTheme || 'esmeralda'];
  const ac = theme.accent;
  const name = pdfSafe(cvGenResult.userName || '');
  const rawCv = cvGenResult.cv;
  const cvIsString = typeof rawCv === 'string';
  const cv = isCV ? (cvIsString ? {} : (rawCv || {})) : {};
  const txt = (s: unknown) => pdfSafe(s);
  const split = (s: unknown, w: number) => doc.splitTextToSize(pdfSafe(s), w);
  const idioma = cvGenForm.idioma || 'es';
  const L = ({
    es: { languages: 'Idiomas', skills: 'Habilidades', experience: 'Experiencia', highlights: 'Logros Clave', education: 'Educación' },
    en: { languages: 'Languages', skills: 'Skills', experience: 'Experience', highlights: 'Key Achievements', education: 'Education' },
    pt: { languages: 'Idiomas', skills: 'Habilidades', experience: 'Experiência', highlights: 'Conquistas-Chave', education: 'Educação' },
  } as Record<string, Record<string, string>>)[idioma] || { languages: 'Idiomas', skills: 'Habilidades', experience: 'Experiencia', highlights: 'Logros Clave', education: 'Educación' };

  // Cover letter standalone
  if (!isCV && !combined) {
    renderCoverLetterOnDoc(doc, { cvGenResult, cvGenForm, ac, name });
    if (returnBase64) return doc.output('datauristring').split(',')[1];
    doc.save(`CoverLetter_${name.replace(/\s/g, '_')}.pdf`);
    return;
  }

  // Combined: cover letter first, then CV
  if (combined && cvGenResult.coverLetter) {
    renderCoverLetterOnDoc(doc, { cvGenResult, cvGenForm, ac, name });
    doc.addPage();
  }

  // ── CV — two-column layout ──
  const leftW = 66;
  const rightX = leftW + 6;
  const rightW = W - rightX - 10;

  const addNewPage = () => {
    doc.addPage();
    doc.setFillColor(...theme.leftBg);
    doc.rect(0, 0, leftW, H, 'F');
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.25);
    doc.line(leftW, 0, leftW, H);
  };

  const chkR = (y: number) => { if (y > H - 14) { addNewPage(); return 15; } return y; };
  const chkL = (ly: number) => { if (ly > H - 14) { addNewPage(); return 15; } return ly; };

  // Left column background
  doc.setFillColor(...theme.leftBg);
  doc.rect(0, 0, leftW, H, 'F');
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.25);
  doc.line(leftW, 0, leftW, H);

  // ── LEFT COLUMN ──
  const lx = 8;
  const lw = leftW - lx - 4;
  let ly = 14;

  // Circular photo
  if (cvPhoto) {
    const photoD = 36;
    const cx = leftW / 2 - photoD / 2;
    try {
      doc.addImage(cvPhoto, 'JPEG', cx, ly, photoD, photoD);
      doc.setDrawColor(...ac);
      doc.setLineWidth(0.8);
      doc.circle(leftW / 2, ly + photoD / 2, photoD / 2 + 0.5, 'S');
      ly += photoD + 5;
    } catch (_) {}
  }

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  const nameWords = name.toUpperCase().split(' ');
  if (nameWords.length > 1) {
    const mid = Math.ceil(nameWords.length / 2);
    doc.text(nameWords.slice(0, mid).join(' '), leftW / 2, ly, { align: 'center' }); ly += 6;
    doc.text(nameWords.slice(mid).join(' '), leftW / 2, ly, { align: 'center' }); ly += 6;
  } else {
    doc.text(name.toUpperCase(), leftW / 2, ly, { align: 'center' }); ly += 7;
  }

  // Job title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ac);
  split(cvGenForm.rol, lw).forEach((l: string) => { doc.text(txt(l).toUpperCase(), leftW / 2, ly, { align: 'center' }); ly += 4; });
  ly += 3;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.25);
  doc.line(lx, ly, leftW - 4, ly);
  ly += 5;

  const leftHeader = (label: string) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...ac);
    doc.text(label.toUpperCase(), lx, ly); ly += 2.5;
    doc.setDrawColor(...ac); doc.setLineWidth(0.3);
    doc.line(lx, ly, leftW - 4, ly); ly += 4;
  };

  // Contacto
  const contactItems = [
    cvGenResult.userEmail && { label: 'Email', val: String(cvGenResult.userEmail) },
    cvGenResult.userPhone && { label: 'Tel', val: String(cvGenResult.userPhone) },
    cvGenResult.userLinkedin && { label: 'LinkedIn', val: String(cvGenResult.userLinkedin) },
  ].filter(Boolean) as { label: string; val: string }[];
  if (contactItems.length) {
    leftHeader('Contacto');
    doc.setFontSize(7);
    contactItems.forEach(({ label, val }) => {
      ly = chkL(ly);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(50, 50, 50);
      doc.text(label, lx, ly); ly += 3.5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      split(val, lw).forEach((l: string) => { ly = chkL(ly); doc.text(l, lx, ly); ly += 3.5; });
      ly += 1;
    });
    ly += 2;
  }

  // Idiomas
  const idiomas = cv.idiomas as string[] | undefined;
  if (idiomas?.length) {
    ly = chkL(ly);
    leftHeader(L.languages);
    doc.setFontSize(7);
    idiomas.forEach(id => {
      ly = chkL(ly);
      const safe = txt(id);
      const parts = safe.split(/—|-/);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(50, 50, 50);
      doc.text((parts[0] || safe).trim(), lx, ly); ly += 3.5;
      if (parts[1]) {
        doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
        doc.text(parts[1].trim(), lx, ly); ly += 3.5;
      }
      ly += 1;
    });
    ly += 2;
  }

  // Habilidades
  const habilidades = cv.habilidades as string[] | undefined;
  const herramientas = cv.herramientas as string[] | undefined;
  const allSkills = [...(habilidades || []), ...(herramientas || [])];
  if (allSkills.length) {
    ly = chkL(ly);
    leftHeader(L.skills);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(60, 60, 60);
    allSkills.slice(0, 16).forEach(s => {
      ly = chkL(ly);
      doc.setFillColor(...ac);
      doc.circle(lx + 1.2, ly - 1.5, 0.7, 'F');
      doc.setTextColor(60, 60, 60);
      split(s, lw - 4).forEach((l: string) => { doc.text(l, lx + 3.5, ly); ly += 4; });
      ly += 0.8;
    });
  }

  // ── RIGHT COLUMN ──
  let ry = 14;

  const rightHeader = (label: string) => {
    ry += 3;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...ac);
    doc.text(label.toUpperCase(), rightX, ry); ry += 2;
    doc.setDrawColor(...ac); doc.setLineWidth(0.4);
    doc.line(rightX, ry, W - 10, ry); ry += 5.5;
  };

  if (isCV && cvIsString) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50);
    for (const rawLine of (String(rawCv || '')).split('\n').map((l: string) => pdfSafe(l))) {
      ry = chkR(ry);
      const line = rawLine.trim();
      if (!line) { ry += 2.5; continue; }
      const isHeader = line === line.toUpperCase() && line.length > 2;
      if (isHeader) {
        ry += 2;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...ac);
        doc.text(line, rightX, ry);
        doc.setDrawColor(...ac); doc.setLineWidth(0.35);
        doc.line(rightX, ry + 1.5, W - 10, ry + 1.5); ry += 6;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      } else {
        split(line, rightW).forEach((wl: string) => { ry = chkR(ry); doc.text(wl, rightX, ry); ry += 4.5; });
      }
    }
  } else {
    const drawBullet = (yPos: number) => {
      doc.setFillColor(100, 100, 100);
      doc.circle(rightX + 2.5, yPos - 1.8, 0.85, 'F');
    };

    // Resumen
    if (cv.resumen) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(65, 65, 65);
      split(cv.resumen, rightW).forEach((l: string) => { ry = chkR(ry); doc.text(l, rightX, ry); ry += 5.2; });
      ry += 3;
    }

    // Experiencia
    const experiencia = cv.experiencia as Record<string,unknown>[] | undefined;
    if (experiencia?.length) {
      ry = chkR(ry);
      rightHeader(L.experience);
      for (let ei = 0; ei < experiencia.length; ei++) {
        const exp = experiencia[ei];
        ry = chkR(ry);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(18, 18, 18);
        split(exp.cargo || '', rightW).forEach((l: string) => { ry = chkR(ry); doc.text(l, rightX, ry); ry += 5.5; });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ac);
        const eStr = [exp.empresa, exp.periodo, exp.ubicacion].filter(Boolean).join('  |  ');
        split(eStr, rightW).forEach((l: string) => { ry = chkR(ry); doc.text(l, rightX, ry); ry += 4.2; });
        ry += 3;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(62, 62, 62);
        const bulletTextX = rightX + 5.5;
        const bulletTextW = rightW - 5.5;
        for (const logro of (exp.logros as string[]) || []) {
          const logroLines = split(logro, bulletTextW);
          logroLines.forEach((l: string, li: number) => {
            ry = chkR(ry);
            if (li === 0) { drawBullet(ry); doc.setTextColor(62, 62, 62); }
            doc.text(l, bulletTextX, ry); ry += 5;
          });
          ry += 1.5;
        }
        ry += 3;
        if (ei < experiencia.length - 1) {
          doc.setDrawColor(228, 228, 228); doc.setLineWidth(0.25);
          doc.line(rightX, ry, W - 10, ry); ry += 6;
        }
      }
      ry += 2;
    }

    // Logros clave
    const logros_clave = cv.logros_clave as string[] | undefined;
    if (logros_clave?.length) {
      ry = chkR(ry);
      rightHeader(L.highlights);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(62, 62, 62);
      const bx = rightX + 5.5, bw = rightW - 5.5;
      for (const logro of logros_clave) {
        split(logro, bw).forEach((l: string, li: number) => {
          ry = chkR(ry);
          if (li === 0) { drawBullet(ry); doc.setTextColor(62, 62, 62); }
          doc.text(l, bx, ry); ry += 5;
        });
        ry += 1.5;
      }
      ry += 3;
    }

    // Educacion
    const educacion = cv.educacion as Record<string,unknown>[] | undefined;
    if (educacion?.length) {
      ry = chkR(ry);
      rightHeader(L.education);
      educacion.forEach((edu, ei) => {
        ry = chkR(ry);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(18, 18, 18);
        split(edu.titulo || '', rightW).forEach((l: string) => { ry = chkR(ry); doc.text(l, rightX, ry); ry += 5.5; });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ac);
        const iStr = pdfSafe([edu.institucion, edu.anio].filter(Boolean).join('  |  '));
        doc.text(iStr, rightX, ry);
        ry += ei < educacion.length - 1 ? 7 : 5;
      });
    }
  }

  if (returnBase64) return doc.output('datauristring').split(',')[1];
  doc.save(`${combined ? 'CV_CoverLetter' : isCV ? 'CV' : 'CoverLetter'}_${name.replace(/\s/g, '_')}.pdf`);
}

export async function generatePortfolioPDF({ portafolio, userName, userEmail, userLinkedin, servicio }: {
  portafolio: Record<string, unknown>;
  userName?: string | null;
  userEmail?: string | null;
  userLinkedin?: string | null;
  servicio: string;
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const safe = (t: unknown) => pdfSafe(t);
  const W = 210, mx = 18, tw = W - mx * 2;
  const splitLines = (text: unknown, width: number) => doc.splitTextToSize(safe(text || ''), width);
  const ac: [number,number,number] = [0, 168, 107];

  doc.setFillColor(...ac);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(safe(userName || 'Portafolio'), mx, 16);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const contactLine = [userEmail, userLinkedin].filter(Boolean).join('   |   ');
  if (contactLine) doc.text(safe(contactLine), mx, 24);
  if (servicio) doc.text(safe(servicio), mx, 30);

  let y = 46;
  doc.setTextColor(45, 55, 72);

  const section = (title: string) => {
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...ac);
    doc.text(safe(title), mx, y);
    doc.setDrawColor(...ac); doc.setLineWidth(0.4);
    doc.line(mx, y + 1, W - mx, y + 1); y += 6;
    doc.setTextColor(45, 55, 72); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  };

  const addText = (text: unknown, indent = 0) => {
    splitLines(text, tw - indent).forEach((l: string) => {
      if (y > 272) { doc.addPage(); y = 20; }
      doc.text(l, mx + indent, y); y += 5;
    });
    y += 1;
  };

  if (portafolio.titular) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bolditalic');
    splitLines(portafolio.titular, tw).forEach((l: string) => { doc.text(l, mx, y); y += 6; });
    y += 2; doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  }
  if (portafolio.propuesta_de_valor) { section('PROPUESTA DE VALOR'); addText(portafolio.propuesta_de_valor); y += 2; }

  const servicios = portafolio.servicios as Record<string,unknown>[] | undefined;
  if (servicios?.length) {
    section('SERVICIOS');
    servicios.forEach(s => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      if (y > 272) { doc.addPage(); y = 20; }
      doc.text(safe(s.nombre), mx, y); y += 5;
      doc.setFont('helvetica', 'normal');
      addText(s.descripcion, 3);
      if (s.beneficio) { doc.setTextColor(...ac); addText('+ ' + s.beneficio, 3); doc.setTextColor(45, 55, 72); }
      y += 1;
    });
    y += 1;
  }

  const diferenciadores = portafolio.diferenciadores as string[] | undefined;
  if (diferenciadores?.length) { section('POR QUÉ YO'); diferenciadores.forEach(d => addText('- ' + d, 2)); y += 2; }

  const proceso = portafolio.proceso as string[] | undefined;
  if (proceso?.length) { section('CÓMO TRABAJO'); proceso.forEach(p => addText(p, 2)); y += 2; }

  const casos = portafolio.casos_exito as string[] | undefined;
  if (casos?.length) { section('RESULTADOS'); casos.forEach(c => addText('- ' + c, 2)); y += 2; }

  if (portafolio.cta) { section('SIGUIENTE PASO'); addText(portafolio.cta); }

  doc.save(`Portafolio_${safe(userName || 'servicios').replace(/\s/g, '_')}.pdf`);
}

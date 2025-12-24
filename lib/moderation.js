const FORBIDDEN_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /\b(spam|scam|hack|virus|malware|phishing)\b/gi,
  /\b(bastardo|idiota|imbécil|estúpido|pendejo|mierda)\b/gi,
  /\b(nigga|nigger|f[u|a]ck|sh[i|y]t|ass|bitch)\b/gi,
];

const SUSPICIOUS_KEYWORDS = [
  'crack',
  'pirated',
  'download illegal',
  'warez',
  'torrent',
  'ddos',
];

export const checkSuspiciousContent = (content) => {
  let isSuspicious = false;

  // Verificar patrones prohibidos
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      isSuspicious = true;
      break;
    }
  }

  // Verificar palabras clave sospechosas
  if (!isSuspicious) {
    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (content.toLowerCase().includes(keyword)) {
        isSuspicious = true;
        break;
      }
    }
  }

  return isSuspicious;
};

export const sanitizeContent = (content) => {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 2000);
};

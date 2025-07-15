import express from 'express';
import { randomBytes } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface UrlEntry {
  originalUrl: string;
  createdAt : number;
  expiresAt: number;
}

const urlStore: Record<string, UrlEntry> = {};
const DEFAULT_TTL = 30 * 60 * 1000; 

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (urlStore[code]);
  return code;
}


app.post('/shorturls', (req, res) => {
  const { url, validity, shortcode } = req.body;
  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'URL must be a string' });
  }
  if (validity !== undefined && typeof validity !== 'number') {
    return res.status(400).json({ error: 'Validity must be a number' });
  }

  let code;
  if (shortcode && !urlStore[shortcode]) {
    code = shortcode;
  } else {
    code = generateShortCode();
  }

  const now = Date.now();
  urlStore[code] = {
    originalUrl: url,
    createdAt : now,
    expiresAt: now + (validity || DEFAULT_TTL),
  };

  res.json({
    shortLink: `${req.protocol}://${req.get('host')}/${code}`,
    expiry: urlStore[code].expiresAt
  });
});


app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];
  if (!entry) {
    return res.status(404).send('Short URL not found');
  }
  if (Date.now() > entry.expiresAt) {
    delete urlStore[code];
    return res.status(410).send('Short URL expired');
  }
  res.redirect(entry.originalUrl);
});

setInterval(() => {
  const now = Date.now();
  for (const code in urlStore) {
    if (urlStore[code].expiresAt < now) {
      delete urlStore[code];
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

app.listen(PORT, () => {
  console.log(`URL Shortener backend running on port ${PORT}`);
});

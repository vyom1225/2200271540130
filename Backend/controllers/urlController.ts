import { Request, Response } from 'express';
import { Url } from '../models/url';
import { sendLog } from '../../LoggingMiddleware/log';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_TTL = 30 * 60 * 1000;

function generateUniqueCode(): string {
  return uuidv4()
}

export async function createShortUrl(req: Request, res: Response) {
  const { url, validity, shortcode } = req.body;

  if (typeof url !== 'string') {
    await sendLog({
      stack: 'backend',
      level: 'error',
      package: 'controller',
      message: 'URL must be a string',
    });
    return res.status(400).json({ error: 'URL must be a string' });
  }

  if (validity !== undefined && typeof validity !== 'number') {
    await sendLog({
      stack: 'backend',
      level: 'error',
      package: 'controller',
      message: 'Validity must be a number',
    });
    return res.status(400).json({ error: 'Validity must be a number' });
  }

  let code = shortcode;
  if (code) {
    const taken = await Url.exists({ code });
    if (taken) {
        code = generateUniqueCode();
    }
  } else {
      code = generateUniqueCode();
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (validity || DEFAULT_TTL));

  try {
    const urlDoc = new Url({
      code,
      originalUrl: url,
      createdAt: now,
      expiresAt,
      clicks: 0,
      interactions: []
    });
    await urlDoc.save();
    res.json({
      shortLink: `${req.protocol}://${req.get('host')}/${code}`,
      expiry: expiresAt
    });
  } catch (err : any) {
    await sendLog({
      stack: 'backend',
      level: 'error',
      package: 'controller',
      message: `Failed to create short URL: ${err.message}`,
    });
    res.status(500).json({ error: 'Failed to create short URL' });
  }
}

export async function redirectToOriginalUrl(req: Request, res: Response) {
  const { code } = req.params;
  try {
    const urlDoc = await Url.findOne({ code });
    if (!urlDoc) {
      await sendLog({
        stack: 'backend',
        level: 'error',
        package: 'controller',
        message: 'Short URL not found',
      });
      return res.status(404).send('Short URL not found');
    }
    if (new Date() > urlDoc.expiresAt) {
      await Url.deleteOne({ code });
      await sendLog({
        stack: 'backend',
        level: 'error',
        package: 'controller',
        message: 'Short URL expired',
      });
      return res.status(410).send('Short URL expired');
    }
    urlDoc.clicks = (urlDoc.clicks || 0) + 1;
    urlDoc.interactions = urlDoc.interactions || [];
    urlDoc.interactions.push({
      timestamp: new Date(),
      source: req.get('referer') || '',
      ip: req.ip || '',
      geo: ''
    });
    await urlDoc.save();
    res.redirect(urlDoc.originalUrl);
  } catch (err: any) {
    await sendLog({
      stack: 'backend',
      level: 'error',
      package: 'controller',
      message: `Error in redirect: ${err.message}`,
    });
    res.status(500).send('Internal server error');
  }
}

export async function getUrlStats(req: Request, res: Response) {
  const { code } = req.params;
  try {
    const urlDoc = await Url.findOne({ code });
    if (!urlDoc) {
      await sendLog({
        stack: 'backend',
        level: 'error',
        package: 'controller',
        message: 'Short URL not found for stats',
      });
      return res.status(404).json({ error: 'Short URL not found' });
    }
    res.json({
      originalUrl: urlDoc.originalUrl,
      createdAt: urlDoc.createdAt,
      expiresAt: urlDoc.expiresAt,
      clicks: urlDoc.clicks || 0,
      interactions: urlDoc.interactions || []
    });
  } catch (err: any) {
    await sendLog({
      stack: 'backend',
      level: 'error',
      package: 'controller',
      message: `Error in stats: ${err.message}`,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
} 
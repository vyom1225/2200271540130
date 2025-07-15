import express from 'express';
import { createShortUrl, redirectToOriginalUrl, getUrlStats } from '../controllers/urlController';

const router = express.Router();

router.post('/shorturls', createShortUrl);
router.get('/:code', redirectToOriginalUrl);
router.get('/shorturls/:code', getUrlStats);

export default router; 
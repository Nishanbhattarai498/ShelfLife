import express from 'express';

const router = express.Router();

// Background push delivery has been removed. Keep the route stubbed so callers
// receive a clear response instead of failing silently.
router.all('*', (_req, res) => {
  return res.status(410).json({ ok: false, error: 'Push notifications are disabled' });
});

export default router;

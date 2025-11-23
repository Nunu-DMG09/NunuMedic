import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// ejemplo: obtener datos del usuario actual
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
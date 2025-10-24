import { Router } from 'express';
import { blockchain } from '../services/blockchain';

const router = Router();

/**
 * GET /api/stats
 * Returns token and platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await blockchain.getStats();

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/stats/:address
 * Returns user-specific statistics
 */
router.get('/stats/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        error: 'Missing address parameter',
      });
    }

    const userStats = await blockchain.getUserStats(address);

    return res.status(200).json({
      success: true,
      address,
      userStats,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch user stats',
    });
  }
});

export default router;


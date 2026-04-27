const express = require('express');
const router = express.Router();
const {
  registerUser,
  registerFoodPartner,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');
const { verifyAccessToken } = require('../middleware/auth');

router.post('/register/user', registerUser);
router.post('/register/food-partner', registerFoodPartner);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', verifyAccessToken, getMe);

module.exports = router;

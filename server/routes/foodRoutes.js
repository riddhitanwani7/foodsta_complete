const express = require('express');
const router = express.Router();
const {
  getFeed,
  getFoodById,
  toggleLike,
  toggleSave,
  getSavedFoods,
  getPartnerFoods,
  deleteFood,
} = require('../controllers/foodController');
const { createFood, createFoodWithUrl } = require('../controllers/uploadController');
const { verifyAccessToken, optionalAuth, requireUser, requireFoodPartner } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public / optional auth routes
router.get('/', optionalAuth, getFeed);
router.get('/saved', verifyAccessToken, requireUser, getSavedFoods);
router.get('/partner/:id', optionalAuth, getPartnerFoods);
router.get('/:id', optionalAuth, getFoodById);

// Protected routes — User only
router.post('/:id/like', verifyAccessToken, requireUser, toggleLike);
router.post('/:id/save', verifyAccessToken, requireUser, toggleSave);

// Protected routes — FoodPartner only
router.post('/create', verifyAccessToken, requireFoodPartner, upload.single('video'), createFood);
router.post('/create-url', verifyAccessToken, requireFoodPartner, createFoodWithUrl);
router.delete('/:id', verifyAccessToken, requireFoodPartner, deleteFood);
module.exports = router;

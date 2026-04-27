const Food = require('../models/Food');
const imagekit = require('../utils/imagekit');

/**
 * Create food with video upload
 * POST /api/food/create
 * Auth: required (FoodPartner only)
 */
const createFood = async (req, res) => {
  try {
    const { name, description, cuisine } = req.body;
    const partnerId = req.user;

    if (!name) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    let videoUrl = '';

    // Try ImageKit upload
    try {
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `food_${Date.now()}_${req.file.originalname}`,
        folder: '/foodsta/videos',
        useUniqueFileName: true,
      });
      videoUrl = result.url;
    } catch (uploadError) {
      console.error('ImageKit upload error:', uploadError.message);
      // Fallback: store as data URI for development (not for production)
      // In production, ImageKit keys must be configured
      return res.status(500).json({
        message: 'Video upload failed. Please configure ImageKit credentials in .env',
      });
    }

    const food = await Food.create({
      name,
      description: description || '',
      cuisine: cuisine || 'General',
      video: videoUrl,
      foodPartner: partnerId,
      likeCount: 0,
      savesCount: 0,
    });

    await food.populate('foodPartner', 'name email phone address');

    res.status(201).json({ food });
  } catch (error) {
    console.error('Create Food Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create food with direct video URL (for seeding/testing)
 * POST /api/food/create-url
 * Auth: required (FoodPartner only)
 */
const createFoodWithUrl = async (req, res) => {
  try {
    const { name, description, cuisine, video } = req.body;
    const partnerId = req.user;

    if (!name || !video) {
      return res.status(400).json({ message: 'Food name and video URL are required' });
    }

    const food = await Food.create({
      name,
      description: description || '',
      cuisine: cuisine || 'General',
      video,
      foodPartner: partnerId,
      likeCount: 0,
      savesCount: 0,
    });

    await food.populate('foodPartner', 'name email phone address');

    res.status(201).json({ food });
  } catch (error) {
    console.error('Create Food URL Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFood,
  createFoodWithUrl,
};

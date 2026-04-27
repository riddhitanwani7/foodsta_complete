const Food = require('../models/Food');
const Like = require('../models/Like');
const Save = require('../models/Save');
const mongoose = require('mongoose');

/**
 * Get food feed with pagination
 * GET /api/food
 * Query: ?page=1&limit=10
 * Auth: optional (for isLiked/isSaved)
 */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const foods = await Food.find()
      .populate('foodPartner', 'name email phone address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Food.countDocuments();

    // If user is authenticated, check isLiked and isSaved for each food
    const userId = req.user;
    let userLikes = [];
    let userSaves = [];

    if (userId && req.userType === 'User') {
      const foodIds = foods.map(f => f._id);

      userLikes = await Like.find({
        user: userId,
        food: { $in: foodIds },
      }).lean();

      userSaves = await Save.find({
        user: userId,
        food: { $in: foodIds },
      }).lean();
    }

    const likedFoodIds = new Set(userLikes.map(l => l.food.toString()));
    const savedFoodIds = new Set(userSaves.map(s => s.food.toString()));

    const foodsWithState = foods.map(food => ({
      ...food,
      isLiked: likedFoodIds.has(food._id.toString()),
      isSaved: savedFoodIds.has(food._id.toString()),
    }));

    res.json({
      foods: foodsWithState,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single food item
 * GET /api/food/:id
 */
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('foodPartner', 'name email phone address')
      .lean();

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check isLiked/isSaved if authenticated
    let isLiked = false;
    let isSaved = false;

    if (req.user && req.userType === 'User') {
      const like = await Like.findOne({ user: req.user, food: food._id });
      const save = await Save.findOne({ user: req.user, food: food._id });
      isLiked = !!like;
      isSaved = !!save;
    }

    res.json({
      food: { ...food, isLiked, isSaved },
    });
  } catch (error) {
    console.error('Get Food Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Toggle like on a food item
 * POST /api/food/:id/like
 * Auth: required (User only)
 *
 * CRITICAL: Uses toggle logic + countDocuments for accuracy
 */
const toggleLike = async (req, res) => {
  try {
    const foodId = req.params.id;
    const userId = req.user;

    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Toggle logic
    const existingLike = await Like.findOne({ user: userId, food: foodId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
    } else {
      // Like
      await Like.create({ user: userId, food: foodId });
    }

    // ALWAYS compute actual count from DB
    const likeCount = await Like.countDocuments({ food: foodId });

    // Update cached count on Food document
    await Food.findByIdAndUpdate(foodId, { likeCount });

    res.json({
      liked: !existingLike,
      likeCount,
    });
  } catch (error) {
    console.error('Toggle Like Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Toggle save on a food item
 * POST /api/food/:id/save
 * Auth: required (User only)
 *
 * CRITICAL: Uses toggle logic + countDocuments for accuracy
 */
const toggleSave = async (req, res) => {
  try {
    const foodId = req.params.id;
    const userId = req.user;

    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Toggle logic
    const existingSave = await Save.findOne({ user: userId, food: foodId });

    if (existingSave) {
      // Unsave
      await Save.deleteOne({ _id: existingSave._id });
    } else {
      // Save
      await Save.create({ user: userId, food: foodId });
    }

    // ALWAYS compute actual count from DB
    const savesCount = await Save.countDocuments({ food: foodId });

    // Update cached count on Food document
    await Food.findByIdAndUpdate(foodId, { savesCount });

    res.json({
      saved: !existingSave,
      savesCount,
    });
  } catch (error) {
    console.error('Toggle Save Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get saved foods for current user
 * GET /api/food/saved
 * Auth: required (User only)
 */
const getSavedFoods = async (req, res) => {
  try {
    const userId = req.user;

    const saves = await Save.find({ user: userId })
      .populate({
        path: 'food',
        populate: {
          path: 'foodPartner',
          select: 'name email phone address',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out any saves where food might have been deleted
    const foods = saves
      .filter(s => s.food)
      .map(s => ({
        ...s.food,
        isLiked: false, // We'll check below
        isSaved: true,
      }));

    // Check which are liked
    if (foods.length > 0) {
      const foodIds = foods.map(f => f._id);
      const likes = await Like.find({
        user: userId,
        food: { $in: foodIds },
      }).lean();

      const likedSet = new Set(likes.map(l => l.food.toString()));
      foods.forEach(f => {
        f.isLiked = likedSet.has(f._id.toString());
      });
    }

    res.json({ foods });
  } catch (error) {
    console.error('Get Saved Foods Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get foods by a specific food partner
 * GET /api/food/partner/:id
 */
const getPartnerFoods = async (req, res) => {
  try {
    const partnerId = req.params.id;

    const foods = await Food.find({ foodPartner: partnerId })
      .populate('foodPartner', 'name email phone address')
      .sort({ createdAt: -1 })
      .lean();

    // Check isLiked/isSaved if authenticated
    const userId = req.user;
    let userLikes = [];
    let userSaves = [];

    if (userId && req.userType === 'User') {
      const foodIds = foods.map(f => f._id);

      userLikes = await Like.find({
        user: userId,
        food: { $in: foodIds },
      }).lean();

      userSaves = await Save.find({
        user: userId,
        food: { $in: foodIds },
      }).lean();
    }

    const likedSet = new Set(userLikes.map(l => l.food.toString()));
    const savedSet = new Set(userSaves.map(s => s.food.toString()));

    const foodsWithState = foods.map(food => ({
      ...food,
      isLiked: likedSet.has(food._id.toString()),
      isSaved: savedSet.has(food._id.toString()),
    }));

    res.json({ foods: foodsWithState });
  } catch (error) {
    console.error('Get Partner Foods Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
/**
 * Delete a food reel
 * DELETE /api/food/:id
 * Auth: required (FoodPartner only)
 */
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Only the owning FoodPartner can delete
    if (food.foodPartner.toString() !== req.user.toString()) {
      return res.status(403).json({ message: 'Unauthorized: you do not own this reel' });
    }

    await Food.findByIdAndDelete(req.params.id);

    // Clean up likes and saves orphaned by this deletion
    await Like.deleteMany({ food: req.params.id });
    await Save.deleteMany({ food: req.params.id });

    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    console.error('Delete Food Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFeed,
  getFoodById,
  toggleLike,
  deleteFood,
  toggleSave,
  getSavedFoods,
  getPartnerFoods,
};

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getUsers, getUsersList } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users/list', getUsersList); // Public — for login dropdown
router.get('/users', protect, authorize('fleet_manager'), getUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/send', sendMessage);
router.patch('/messages/:messageId/read', markAsRead);

module.exports = router;

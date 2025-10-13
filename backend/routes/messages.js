const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, Conversation } = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
      isActive: true
    }).sort({ lastActivity: -1 });

    // Add unread count and format for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.userId
      );

      return {
        id: conv._id,
        participants: conv.participants.map(p => p._id),
        projectId: conv.projectId,
        lastMessage: conv.lastMessage,
        unreadCount: 0, // TODO: Calculate actual unread count
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherParticipant: {
          id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          avatar: otherParticipant.avatar,
          isOnline: otherParticipant.isOnline
        },
        project: conv.projectId ? {
          id: conv.projectId._id,
          title: conv.projectId.title,
          status: conv.projectId.status
        } : null
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
    .populate('senderId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', auth, [
  body('conversationId').isMongoId(),
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { conversationId, content } = req.body;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get receiver ID
    const receiverId = conversation.participants.find(
      p => p.toString() !== req.userId
    );

    // Create message
    const message = new Message({
      conversationId,
      senderId: req.userId,
      receiverId,
      content
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create conversation
router.post('/', auth, [
  body('participantId').isMongoId(),
  body('projectId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId, projectId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId] },
      projectId: projectId || { $exists: false }
    });

    if (conversation) {
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.userId, participantId],
      projectId
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark conversation as read
router.patch('/:conversationId/read', auth, async (req, res) => {
  try {
    // Mark all messages in conversation as read
    await Message.updateMany({
      conversationId: req.params.conversationId,
      receiverId: req.userId,
      isRead: false
    }, {
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.userId,
      isRead: false
    });

    res.json(count);
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search conversations
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const conversations = await Conversation.find({
      participants: req.userId,
      isActive: true
    }).populate({
      path: 'participants',
      match: {
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } }
        ]
      }
    });

    res.json(conversations.filter(conv => 
      conv.participants.some(p => p._id.toString() !== req.userId)
    ));
  } catch (error) {
    console.error('Search conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
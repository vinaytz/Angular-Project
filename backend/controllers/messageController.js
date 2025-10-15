const supabase = require('../config/supabase');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          content,
          sender_id,
          created_at,
          is_read
        )
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }

    const conversationsWithLastMessage = conversations.map(conv => {
      const messages = conv.messages || [];
      const lastMessage = messages.length > 0
        ? messages.reduce((latest, msg) =>
            new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
          )
        : null;

      const otherParticipantId = conv.participant_1_id === userId
        ? conv.participant_2_id
        : conv.participant_1_id;

      return {
        ...conv,
        lastMessage,
        otherParticipantId,
        messages: undefined
      };
    });

    res.json(conversationsWithLastMessage);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (convError || !conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let finalConversationId = conversationId;

    if (!conversationId && recipientId) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1_id.eq.${senderId},participant_2_id.eq.${recipientId}),and(participant_1_id.eq.${recipientId},participant_2_id.eq.${senderId})`)
        .maybeSingle();

      if (existingConv) {
        finalConversationId = existingConv.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: senderId,
            participant_2_id: recipientId
          })
          .select()
          .single();

        if (convError) {
          return res.status(500).json({ message: 'Error creating conversation', error: convError.message });
        }

        finalConversationId = newConv.id;
      }
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        sender_id: senderId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error sending message', error: error.message });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('*, conversations(*)')
      .eq('id', messageId)
      .single();

    if (msgError || !message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender_id === userId) {
      return res.status(400).json({ message: 'Cannot mark own message as read' });
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      return res.status(500).json({ message: 'Error updating message', error: error.message });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
};

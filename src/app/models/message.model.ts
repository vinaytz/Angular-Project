export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  projectId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  otherParticipant: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline: boolean;
  };
  project?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}
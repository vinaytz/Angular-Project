import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Conversation, Message as MessageType } from '../../services/message.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-message',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './message.html',
  styleUrl: './message.css'
})
export class Message implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  messages: MessageType[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  showChatView: boolean = false;
  currentUserId: string = '';
  private subscriptions: Subscription[] = [];

  constructor(private messageService: MessageService) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.currentUserId = userData.id || userData._id;
    }
  }

  ngOnInit(): void {
    this.loadConversations();

    const refreshSub = interval(10000).subscribe(() => {
      this.loadConversations();
      if (this.currentConversation) {
        this.loadMessages(this.currentConversation.id);
      }
    });

    this.subscriptions.push(refreshSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadConversations(): void {
    const sub = this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  openChat(conversation: Conversation): void {
    this.currentConversation = conversation;
    this.showChatView = true;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: string): void {
    const sub = this.messageService.getMessages(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentConversation) {
      return;
    }

    const sub = this.messageService.sendMessage(
      this.currentConversation.id,
      null,
      this.newMessage
    ).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
        this.loadConversations();
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  backToMessages(): void {
    this.showChatView = false;
    this.currentConversation = null;
    this.messages = [];
  }

  scrollToBottom(): void {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  getFilteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) {
      return this.conversations;
    }

    const query = this.searchQuery.toLowerCase();
    return this.conversations.filter(conv =>
      conv.otherParticipantName?.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    );
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today ${timeStr}`;
    }

    return `${date.toLocaleDateString()} ${timeStr}`;
  }

  isOwnMessage(senderId: string): boolean {
    return senderId === this.currentUserId;
  }
}

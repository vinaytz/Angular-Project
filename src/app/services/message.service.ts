import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message, Conversation, SendMessageRequest } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_URL = 'http://localhost:3000/api';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations`);
  }

  getConversationMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/conversations/${conversationId}/messages`);
  }

  sendMessage(messageData: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.API_URL}/messages`, messageData);
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/conversations/${conversationId}/read`, {});
  }

  createConversation(participantId: string, projectId?: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.API_URL}/conversations`, {
      participantId,
      projectId
    });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/messages/unread-count`);
  }

  searchConversations(query: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations/search?q=${query}`);
  }
}
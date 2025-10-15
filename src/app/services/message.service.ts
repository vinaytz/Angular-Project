import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
  lastMessage?: Message;
  otherParticipantId?: string;
  otherParticipantName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:5000/api/messages';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, {
      headers: this.getHeaders()
    }).pipe(
      tap(conversations => this.conversationsSubject.next(conversations))
    );
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(conversationId: string | null, recipientId: string | null, content: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/send`,
      { conversationId, recipientId, content },
      { headers: this.getHeaders() }
    );
  }

  markAsRead(messageId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/messages/${messageId}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUnreadCount(): number {
    const conversations = this.conversationsSubject.value;
    const currentUserId = this.getCurrentUserId();

    return conversations.reduce((count, conv) => {
      if (conv.lastMessage &&
          conv.lastMessage.sender_id !== currentUserId &&
          !conv.lastMessage.is_read) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  private getCurrentUserId(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData._id;
    }
    return '';
  }
}

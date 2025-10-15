import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div class="notification notification-{{ notification.type }}" [@slideIn]>
          <div class="notification-content">
            <div class="notification-icon">
              @if (notification.type === 'success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              }
              @if (notification.type === 'error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @if (notification.type === 'info') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
              @if (notification.type === 'warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <button
              class="notification-close"
              (click)="notificationService.remove(notification.id)"
              aria-label="Close notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: calc(100% - 2rem);
    }

    .notification {
      background: rgba(15, 15, 35, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(calc(100% + 1rem));
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      position: relative;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-success {
      border-left: 4px solid #10b981;
    }

    .notification-success .notification-icon {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .notification-error {
      border-left: 4px solid #ef4444;
    }

    .notification-error .notification-icon {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .notification-info {
      border-left: 4px solid #3b82f6;
    }

    .notification-info .notification-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .notification-warning {
      border-left: 4px solid #f59e0b;
    }

    .notification-warning .notification-icon {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .notification-message {
      flex: 1;
      color: #e2e8f0;
      font-size: 0.95rem;
      line-height: 1.4;
      margin: 0;
    }

    .notification-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      background: rgba(148, 163, 184, 0.1);
      color: #e2e8f0;
    }

    @media (max-width: 640px) {
      .notification-container {
        top: 5rem;
        right: 0.5rem;
        left: 0.5rem;
        width: auto;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}
}

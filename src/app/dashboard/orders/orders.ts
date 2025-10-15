import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FreelancerService } from '../../services/freelancer.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  activeOrders: any[] = [];
  pendingOrders: any[] = [];
  completedOrders: any[] = [];
  loading = true;
  activeTab = 'active';

  constructor(
    private freelancerService: FreelancerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      this.loading = true;
      const data = await this.freelancerService.getOrders();
      this.activeOrders = data.active || [];
      this.pendingOrders = data.pending || [];
      this.completedOrders = data.completed || [];
    } catch (error: any) {
      this.notificationService.error(error.message || 'Failed to load orders');
    } finally {
      this.loading = false;
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  calculateDaysLeft(deadline: string): string {
    if (!deadline) return 'N/A';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week left' : `${weeks} weeks left`;
  }

  isUrgent(deadline: string): boolean {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getClientName(client: any): string {
    if (!client) return 'Unknown Client';
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || 'Unknown Client';
  }

  getClientImage(client: any): string {
    return client?.profileImageUrl || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-client-home',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './client-home.html',
  styleUrl: './client-home.css'
})
export class ClientHomeComponent implements OnInit {
  dashboardData = signal<any>(null);
  gigs = signal<any[]>([]);
  loading = signal(true);
  userName = signal('');
  showCreateGig = signal(false);

  gigForm = {
    title: '',
    description: '',
    category: '',
    budget: 0,
    deadline: ''
  };

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(user.firstName);
    }

    await this.loadDashboardData();
    await this.loadGigs();
  }

  async loadDashboardData() {
    try {
      const data = await this.clientService.getDashboard();
      this.dashboardData.set(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  async loadGigs() {
    try {
      const data = await this.clientService.getGigs();
      this.gigs.set(data.gigs || []);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async createGig() {
    try {
      await this.clientService.createGig(this.gigForm);
      this.notificationService.success('Gig created successfully!');
      this.showCreateGig.set(false);
      this.resetForm();
      await this.loadGigs();
      await this.loadDashboardData();
    } catch (error: any) {
      this.notificationService.error(error.message || 'Failed to create gig');
    }
  }

  resetForm() {
    this.gigForm = {
      title: '',
      description: '',
      category: '',
      budget: 0,
      deadline: ''
    };
  }

  formatBudget(budget: number): string {
    return `$${budget.toLocaleString()}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

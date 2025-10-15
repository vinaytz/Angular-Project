import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-client-orders',
  imports: [RouterLink, CommonModule],
  templateUrl: './client-orders.html',
  styleUrl: './client-orders.css'
})
export class ClientOrdersComponent implements OnInit {
  requests = signal<any[]>([]);
  projects = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<'requests' | 'active'>('requests');

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      const [requestsData, projectsData] = await Promise.all([
        this.clientService.getRequests(),
        this.clientService.getProjects()
      ]);

      this.requests.set(requestsData.requests || []);
      this.projects.set(projectsData.projects || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async acceptRequest(requestId: string) {
    try {
      await this.clientService.acceptRequest(requestId);
      this.notificationService.success('Request accepted! Project created successfully.');
      await this.loadData();
    } catch (error: any) {
      this.notificationService.error(error.message || 'Failed to accept request');
    }
  }

  setTab(tab: 'requests' | 'active') {
    this.activeTab.set(tab);
  }

  getActiveProjectsCount(): number {
    return this.projects().filter(p => p.status === 'active').length;
  }

  getActiveProjects(): any[] {
    return this.projects().filter(p => p.status === 'active');
  }
}

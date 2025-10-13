import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { MessageService } from '../../services/message.service';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { Conversation } from '../../models/message.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  currentUser: User | null = null;
  activeProjects: Project[] = [];
  recentMessages: Conversation[] = [];
  stats = {
    activeProjects: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    completedProjects: 0
  };
  isLoading = true;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadDashboardData(): void {
    if (!this.currentUser) return;

    // Load active projects
    this.projectService.getProjects('active', this.currentUser.id).subscribe({
      next: (projects) => {
        this.activeProjects = projects.slice(0, 3); // Show only first 3
        this.stats.activeProjects = projects.length;
      },
      error: (error) => console.error('Error loading projects:', error)
    });

    // Load user stats
    this.projectService.getUserStats(this.currentUser.id).subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
      },
      error: (error) => console.error('Error loading stats:', error)
    });

    // Load recent messages
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.recentMessages = conversations.slice(0, 3); // Show only first 3
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getProjectStatusClass(status: string): string {
    switch (status) {
      case 'urgent': return 'urgent';
      case 'active': return 'normal';
      case 'completed': return 'completed';
      default: return 'normal';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }
}

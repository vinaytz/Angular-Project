import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-client-profile',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './client-profile.html',
  styleUrl: './client-profile.css'
})
export class ClientProfileComponent implements OnInit {
  profile = signal<any>(null);
  user = signal<any>(null);
  loading = signal(true);

  profileForm = {
    companyName: '',
    bio: ''
  };

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.user.set(this.authService.currentUser());
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const data = await this.clientService.getProfile();
      this.profile.set(data.profile);
      this.profileForm.companyName = data.profile.companyName || '';
      this.profileForm.bio = data.profile.bio || '';
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile() {
    try {
      await this.clientService.updateProfile(this.profileForm);
      this.notificationService.success('Profile updated successfully!');
      await this.loadProfile();
    } catch (error: any) {
      this.notificationService.error(error.message || 'Failed to update profile');
    }
  }

  logout() {
    this.authService.logout();
  }
}

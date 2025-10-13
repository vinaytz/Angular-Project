import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getProjects(status?: string, userId?: string): Observable<Project[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (userId) params = params.set('userId', userId);

    return this.http.get<Project[]>(`${this.API_URL}/projects`, { params });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/projects/${id}`);
  }

  createProject(projectData: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/projects`, projectData);
  }

  updateProject(id: string, projectData: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/projects/${id}`, projectData);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }

  applyToProject(projectId: string, proposal: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/projects/${projectId}/apply`, { proposal });
  }

  acceptFreelancer(projectId: string, freelancerId: string): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/projects/${projectId}/accept`, { freelancerId });
  }

  updateProgress(projectId: string, progress: number): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/projects/${projectId}/progress`, { progress });
  }

  completeProject(projectId: string): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/projects/${projectId}/complete`, {});
  }

  getUserStats(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/projects/stats/${userId}`);
  }
}
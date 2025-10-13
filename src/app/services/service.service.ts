import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, ServiceCategory } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getServices(filters?: any): Observable<Service[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Service[]>(`${this.API_URL}/services`, { params });
  }

  getFeaturedServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.API_URL}/services/featured`);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.API_URL}/services/${id}`);
  }

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.API_URL}/categories`);
  }

  searchServices(query: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.API_URL}/services/search?q=${query}`);
  }

  createService(serviceData: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.API_URL}/services`, serviceData);
  }

  updateService(id: string, serviceData: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.API_URL}/services/${id}`, serviceData);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/services/${id}`);
  }
}
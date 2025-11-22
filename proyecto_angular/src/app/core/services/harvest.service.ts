// core/services/harvest.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Harvest, HarvestRequest } from '../interfaces/harvest.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HarvestService {
  private apiUrl = `${environment.apiUrl}/harvest`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(this.apiUrl);
  }

  findById(id: number): Observable<Harvest> {
    return this.http.get<Harvest>(`${this.apiUrl}/${id}`);
  }

  save(harvest: HarvestRequest): Observable<Harvest> {
    return this.http.post<Harvest>(this.apiUrl, harvest);
  }

  update(harvest: Harvest): Observable<Harvest> {
    return this.http.put<Harvest>(this.apiUrl, harvest);
  }

  delete(id: number): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/delete/${id}`, {});
  }

  restore(id: number): Observable<Harvest> {
    return this.http.patch<Harvest>(`${this.apiUrl}/restore/${id}`, {});
  }

  findByState(state: string): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(`${this.apiUrl}/state/${state}`);
  }

  findByIdSeller(idSeller: number): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(`${this.apiUrl}/seller/${idSeller}`);
  }

  findByFruitName(fruitName: string): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(`${this.apiUrl}/fruit/${fruitName}`);
  }

  findByHarvestDate(date: string): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(`${this.apiUrl}/date/${date}`);
  }

  findByDateRange(startDate: string, endDate: string): Observable<Harvest[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Harvest[]>(`${this.apiUrl}/daterange`, { params });
  }

  searchByFruitName(fruitName: string): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(`${this.apiUrl}/search/${fruitName}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarketCustomer } from '../interfaces/market-customer.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketCustomerService {
  private apiUrl = `http://localhost:8085/v1/api/marketcustomer`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  findAll(): Observable<MarketCustomer[]> {
    return this.http.get<MarketCustomer[]>(this.apiUrl);
  }

  findById(id: number): Observable<MarketCustomer> {
    return this.http.get<MarketCustomer>(`${this.apiUrl}/${id}`);
  }

  save(customer: MarketCustomer): Observable<MarketCustomer> {
    return this.http.post<MarketCustomer>(this.apiUrl, customer, this.httpOptions);
  }

  update(customer: MarketCustomer): Observable<MarketCustomer> {
    return this.http.put<MarketCustomer>(this.apiUrl, customer, this.httpOptions);
  }

  delete(id: number): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/delete/${id}`, {});
  }

  restore(id: number): Observable<MarketCustomer> {
    return this.http.patch<MarketCustomer>(`${this.apiUrl}/restore/${id}`, {});
  }

  findByState(state: string): Observable<MarketCustomer[]> {
    return this.http.get<MarketCustomer[]>(`${this.apiUrl}/state/${state}`);
  }

  findByDocumentNumber(documentNumber: string): Observable<MarketCustomer> {
    return this.http.get<MarketCustomer>(`${this.apiUrl}/document/${documentNumber}`);
  }

  findByMarketName(marketName: string): Observable<MarketCustomer[]> {
    return this.http.get<MarketCustomer[]>(`${this.apiUrl}/market/${marketName}`);
  }

  findByCity(city: string): Observable<MarketCustomer[]> {
    return this.http.get<MarketCustomer[]>(`${this.apiUrl}/city/${city}`);
  }

  searchByName(name: string): Observable<MarketCustomer[]> {
    return this.http.get<MarketCustomer[]>(`${this.apiUrl}/search/${name}`);
  }
}
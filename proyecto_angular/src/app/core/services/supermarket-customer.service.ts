import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupermarketCustomer } from '../interfaces/supermarket-customer.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupermarketCustomerService {
  private apiUrl = `http://localhost:8085/v1/api/supermarketcustomer`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  findAll(): Observable<SupermarketCustomer[]> {
    return this.http.get<SupermarketCustomer[]>(this.apiUrl);
  }

  findById(id: number): Observable<SupermarketCustomer> {
    return this.http.get<SupermarketCustomer>(`${this.apiUrl}/${id}`);
  }

  save(customer: SupermarketCustomer): Observable<SupermarketCustomer> {
    return this.http.post<SupermarketCustomer>(this.apiUrl, customer, this.httpOptions);
  }

  update(customer: SupermarketCustomer): Observable<SupermarketCustomer> {
    return this.http.put<SupermarketCustomer>(this.apiUrl, customer, this.httpOptions);
  }

  delete(id: number): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/delete/${id}`, {});
  }

  restore(id: number): Observable<SupermarketCustomer> {
    return this.http.patch<SupermarketCustomer>(`${this.apiUrl}/restore/${id}`, {});
  }

  findByState(state: string): Observable<SupermarketCustomer[]> {
    return this.http.get<SupermarketCustomer[]>(`${this.apiUrl}/state/${state}`);
  }

  findByRuc(ruc: string): Observable<SupermarketCustomer> {
    return this.http.get<SupermarketCustomer>(`${this.apiUrl}/ruc/${ruc}`);
  }

  findByCity(city: string): Observable<SupermarketCustomer[]> {
    return this.http.get<SupermarketCustomer[]>(`${this.apiUrl}/city/${city}`);
  }
}
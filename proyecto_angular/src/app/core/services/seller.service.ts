import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seller } from '../interfaces/seller.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = `http://localhost:8085/v1/api/seller`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los vendedores
   */
  findAll(): Observable<Seller[]> {
    return this.http.get<Seller[]>(this.apiUrl);
  }

  /**
   * Obtiene un vendedor por su ID
   */
  findById(id: number): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/${id}`);
  }

  /**
   * Guarda un nuevo vendedor
   */
  save(seller: Seller): Observable<Seller> {
    return this.http.post<Seller>(this.apiUrl, seller);
  }

  /**
   * Actualiza un vendedor existente
   */
  update(seller: Seller): Observable<Seller> {
    return this.http.put<Seller>(this.apiUrl, seller);
  }

  /**
   * Desactiva un vendedor (soft delete)
   * 
   * NOTA: El backend devuelve texto plano, no JSON
   */
  delete(id: number): Observable<string> {
    return this.http.patch(`${this.apiUrl}/delete/${id}`, {}, {
      responseType: 'text'  // 👈 IMPORTANTE: Le decimos que espere texto, no JSON
    });
  }

  /**
   * Restaura un vendedor desactivado
   */
  restore(id: number): Observable<Seller> {
    return this.http.patch<Seller>(`${this.apiUrl}/restore/${id}`, {});
  }

  /**
   * Obtiene vendedores por estado (A=Activo, I=Inactivo)
   */
  findByState(state: string): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${this.apiUrl}/state/${state}`);
  }

  /**
   * Busca un vendedor por DNI
   */
  findByDni(dni: string): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/dni/${dni}`);
  }

  /**
   * Busca un vendedor por Email
   */
  findByEmail(email: string): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/email/${email}`);
  }

  /**
   * Busca vendedores por nombre
   */
  searchByName(name: string): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${this.apiUrl}/search/${name}`);
  }
}
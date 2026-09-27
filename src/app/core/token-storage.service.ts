import { Injectable } from '@angular/core';

const TOKEN_KEY = 'accessToken';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return sessionStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Client-side Authentication and Player Progress Service.
 * Communicates with backend endpoints (/api/auth/* and /api/player/*).
 */

const TOKEN_KEY = 'watersort_auth_token';

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY) || null;
    this.currentUser = null;
    this.saveTimeout = null;
  }

  getToken() {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    this.setToken(data.token);
    this.currentUser = data.user;
    return data;
  }

  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to log in.');
    }

    this.setToken(data.token);
    this.currentUser = data.user;
    return data;
  }

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Token invalid or expired
        this.setToken(null);
        this.currentUser = null;
        return null;
      }

      const data = await res.json();
      this.currentUser = data.user;
      return data;
    } catch (err) {
      console.warn('[Auth] Network error checking current user:', err);
      return null;
    }
  }

  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('[Auth] Error notifying server of logout:', err);
      }
    }
    this.setToken(null);
    this.currentUser = null;
  }

  /**
   * Save player progress to server database (debounced for optimal performance)
   */
  saveProgress(arg1, arg2) {
    const progress = arg2 !== undefined ? arg2 : arg1;
    const token = this.getToken();
    if (!token || !progress || typeof progress !== 'object') return;

    if (this.currentUser?.username) {
      try {
        localStorage.setItem(
          `watersort_backup_${this.currentUser.username}`,
          JSON.stringify(progress)
        );
      } catch (e) {
        // ignore storage quota
      }
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/player/progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(progress),
        });

        if (!res.ok) {
          const errData = await res.json();
          console.warn('[Auth] Server progress save warning:', errData.error);
        }
      } catch (err) {
        console.warn('[Auth] Network error while saving progress:', err);
      }
    }, 400);
  }
}

export const authService = new AuthService();


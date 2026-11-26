/**
 * Client-side Authentication and Player Progress Service.
 * Supports both Backend API endpoints (/api/auth/*) and seamless Local-First
 * offline browser storage fallback (for static hosting such as GitHub Pages,
 * Vercel, Netlify, or offline play).
 */

const TOKEN_KEY = 'watersort_auth_token';
const LOCAL_USERS_KEY = 'nut_sort_local_users_db';
const LOCAL_ACTIVE_USER_KEY = 'nut_sort_active_user_session';

const DEFAULT_INITIAL_PROGRESS = {
  stage: 1,
  highestUnlocked: 1,
  coins: 250,
  stars: 125,
  gems: 15,
  activeTheme: 'playbg3',
  unlockedThemes: ['playbg3'],
  activeSkin: 'classic',
  unlockedSkins: ['classic'],
  activeNutSkin: 'steel_classic',
  unlockedNutSkins: ['steel_classic'],
  soundEnabled: true,
  musicEnabled: false,
  vibrationEnabled: true,
};

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

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

  /**
   * Register a new user.
   * Tries remote backend API first; if on static hosting (GitHub Pages, etc.)
   * or server is unreachable, seamlessly creates and stores the account locally.
   */
  async register(username, password) {
    const cleanUsername = username.trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        let data = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          data = null;
        }

        if (data) {
          if (!res.ok) {
            throw new Error(data.error || 'Failed to create account.');
          }
          this.setToken(data.token);
          this.currentUser = data.user;
          return data;
        }
      }
    } catch (err) {
      // If it's an explicit validation error from server (e.g. duplicate username), throw it
      if (err.message && (err.message.includes('already exists') || err.message.includes('characters') || err.message.includes('contain') || err.message.includes('Password'))) {
        throw err;
      }
      // Otherwise, server is not running or static host returned 404 HTML -> fallback to local storage
      console.info('[Auth] Server API unavailable, using local browser account storage.');
    }

    // --- Local Storage Fallback Account Creation ---
    const users = getLocalUsers();
    const existing = users.find(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (existing) {
      throw new Error('Username already exists. Please choose another username or log in.');
    }

    const newUser = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      username: cleanUsername,
      password,
      createdAt: new Date().toISOString(),
      progress: { ...DEFAULT_INITIAL_PROGRESS, lastPlayedAt: new Date().toISOString() },
    };

    users.push(newUser);
    saveLocalUsers(users);

    const token = 'local_token_' + newUser.id;
    this.setToken(token);
    this.currentUser = { id: newUser.id, username: newUser.username };
    try {
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(newUser));
    } catch (e) {}

    return {
      success: true,
      token,
      user: this.currentUser,
      progress: newUser.progress,
    };
  }

  /**
   * Log in an existing user.
   * Tries remote backend API first; falls back to local storage accounts.
   */
  async login(username, password) {
    const cleanUsername = username.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        let data = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          data = null;
        }

        if (data) {
          if (!res.ok) {
            throw new Error(data.error || 'Failed to log in.');
          }
          this.setToken(data.token);
          this.currentUser = data.user;
          return data;
        }
      }
    } catch (err) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('Password') || err.message.includes('not found') || err.message.includes('incorrect'))) {
        throw err;
      }
      console.info('[Auth] Server API unavailable, verifying local browser account storage.');
    }

    // --- Local Storage Fallback Authentication ---
    const users = getLocalUsers();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      throw new Error('Invalid username or password.');
    }

    const token = 'local_token_' + user.id;
    this.setToken(token);
    this.currentUser = { id: user.id, username: user.username };
    try {
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(user));
    } catch (e) {}

    return {
      success: true,
      token,
      user: this.currentUser,
      progress: user.progress || DEFAULT_INITIAL_PROGRESS,
    };
  }

  /**
   * Check current active user session on app launch
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    // Check if it's a local session
    if (token.startsWith('local_token_')) {
      try {
        const raw = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
        if (raw) {
          const user = JSON.parse(raw);
          this.currentUser = { id: user.id, username: user.username };
          return { user: this.currentUser, progress: user.progress };
        }
      } catch (e) {}
    }

    // Try backend API
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        let data = null;
        try {
          data = await res.json();
        } catch (e) {
          data = null;
        }

        if (data) {
          if (!res.ok) {
            this.setToken(null);
            this.currentUser = null;
            return null;
          }
          this.currentUser = data.user;
          return data;
        }
      }
    } catch (err) {
      console.warn('[Auth] Network error checking current user:', err);
    }

    // Fallback: check local active session if available
    try {
      const raw = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
      if (raw) {
        const user = JSON.parse(raw);
        this.currentUser = { id: user.id, username: user.username };
        return { user: this.currentUser, progress: user.progress };
      }
    } catch (e) {}

    return null;
  }

  async logout() {
    const token = this.getToken();
    if (token && !token.startsWith('local_token_')) {
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
    try {
      localStorage.removeItem(LOCAL_ACTIVE_USER_KEY);
    } catch (e) {}
  }

  /**
   * Persist progress locally for active user and optionally send immediately to backend
   */
  _persistLocalProgress(progress) {
    if (this.currentUser?.username) {
      try {
        const users = getLocalUsers();
        const idx = users.findIndex(
          (u) => u.username.toLowerCase() === this.currentUser.username.toLowerCase()
        );
        if (idx !== -1) {
          users[idx].progress = { ...users[idx].progress, ...progress };
          saveLocalUsers(users);
          localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(users[idx]));
        }
        localStorage.setItem(
          `watersort_backup_${this.currentUser.username}`,
          JSON.stringify(progress)
        );
      } catch (e) {}
    }
  }

  async _pushServerProgress(progress) {
    const token = this.getToken();
    if (!token || token.startsWith('local_token_')) return;
    try {
      const res = await fetch('/api/player/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(progress),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json') && !res.ok) {
        const errData = await res.json();
        console.warn('[Auth] Server progress save warning:', errData.error);
      }
    } catch (err) {
      console.warn('[Auth] Network error while saving progress:', err);
    }
  }

  /**
   * Immediately persist player progress (used for shop purchases, equipping items, and wins)
   */
  saveProgressNow(arg1, arg2) {
    const progress = arg2 !== undefined ? arg2 : arg1;
    if (!progress || typeof progress !== 'object') return;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this._persistLocalProgress(progress);
    this._pushServerProgress(progress);
  }

  /**
   * Save player progress to server database and/or local database (debounced server write)
   */
  saveProgress(arg1, arg2) {
    const progress = arg2 !== undefined ? arg2 : arg1;
    const token = this.getToken();
    if (!progress || typeof progress !== 'object') return;

    this._persistLocalProgress(progress);

    if (token && !token.startsWith('local_token_')) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(() => {
        this._pushServerProgress(progress);
      }, 400);
    }
  }
}

export const authService = new AuthService();



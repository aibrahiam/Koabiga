import { router } from '@inertiajs/react';

// User type definition
export interface User {
  id: number;
  name: string;
  email?: string;
  role: 'admin' | 'unit_leader' | 'member';
  avatar?: string | null;
  christian_name?: string;
  family_name?: string;
  phone?: string;
}

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkInterval: number;
}

// Session storage keys
const USER_STORAGE_KEY = 'koabiga_user';
const LEGACY_USER_KEY = 'user';

// Store user data in localStorage
export function storeUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

// Get user data from localStorage
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
}

// Migrate legacy session data
export function migrateLegacySession(): User | null {
  if (typeof window !== 'undefined') {
    try {
      const legacyData = localStorage.getItem(LEGACY_USER_KEY);
      if (legacyData) {
        const user = JSON.parse(legacyData);
        // Store in new format
        storeUser(user);
        // Remove legacy data
        localStorage.removeItem(LEGACY_USER_KEY);
        return user;
      }
    } catch (error) {
      console.error('Error migrating legacy session:', error);
    }
  }
  return null;
}

// Clear session on login page
export function clearSessionOnLoginPage(): void {
  if (typeof window !== 'undefined') {
    // Only clear user data, not all localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  }
}

class SessionManager {
  private config: SessionConfig;
  private warningShown: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      timeoutMinutes: 15,
      warningMinutes: 2,
      checkInterval: 30000, // Check every 30 seconds
      ...config
    };

    this.init();
  }

  private init(): void {
    // Update last activity on user interaction
    this.setupActivityListeners();
    
    // Start checking session status
    this.startSessionCheck();
    
    // Check session on page load
    this.checkSession();
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkSession();
      }
    });
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }

  private startSessionCheck(): void {
    this.checkInterval = setInterval(() => {
      this.checkSession();
    }, this.config.checkInterval);
  }

  private checkSession(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const warningMs = (this.config.timeoutMinutes - this.config.warningMinutes) * 60 * 1000;

    // Show warning if approaching timeout
    if (timeSinceLastActivity >= warningMs && !this.warningShown) {
      this.showWarning();
    }

    // Logout if timeout exceeded
    if (timeSinceLastActivity >= timeoutMs) {
      this.logout();
    }
  }

  private showWarning(): void {
    this.warningShown = true;
    
    const warningMessage = `Your session will expire in ${this.config.warningMinutes} minutes due to inactivity. Click anywhere to extend your session.`;
    
    // Create warning notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <p class="font-medium">Session Expiring Soon</p>
          <p class="text-sm opacity-90">${warningMessage}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  private logout(): void {
    // Clear any existing intervals
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Show logout notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <p class="font-medium">Session Expired</p>
          <p class="text-sm opacity-90">You have been logged out due to inactivity.</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Redirect to logout after 2 seconds
    setTimeout(() => {
      router.post('/logout', {}, {
        onSuccess: () => {
          window.location.href = '/';
        }
      });
    }, 2000);
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  public extendSession(): void {
    this.updateLastActivity();
  }
}

// Create global instance
export const sessionManager = new SessionManager();

// Export for manual control
export default SessionManager; 

export function clearSession() {
  if (typeof window !== 'undefined') {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  }
} 
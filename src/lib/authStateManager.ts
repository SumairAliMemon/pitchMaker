// Cross-tab communication utility for authentication state
export class AuthStateManager {
  private static readonly STORAGE_KEY = 'auth_state_change'
  private static readonly AUTH_SUCCESS_EVENT = 'auth_success'
  
  // Broadcast authentication success to all tabs
  static broadcastAuthSuccess() {
    // Use localStorage to communicate between tabs
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      event: this.AUTH_SUCCESS_EVENT,
      timestamp: Date.now()
    }))
    
    // Remove the item to allow for repeated broadcasts
    setTimeout(() => {
      localStorage.removeItem(this.STORAGE_KEY)
    }, 100)
  }
  
  // Listen for authentication events from other tabs
  static onAuthSuccess(callback: () => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.STORAGE_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.event === this.AUTH_SUCCESS_EVENT) {
            callback()
          }
        } catch (error) {
          console.error('Error parsing auth state change:', error)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }
}

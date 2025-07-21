// Error handling utilities for user-friendly error messages

export class ErrorHandler {
  /**
   * Convert technical errors into user-friendly messages
   * @param {Error|string} error - The error object or message
   * @param {string} context - The context where the error occurred (login, registration, etc.)
   * @returns {string} User-friendly error message
   */
  static formatUserError(error, context = '') {
    let message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'
    
    // Filter out technical webpack/build errors
    if (this.isTechnicalError(message)) {
      return this.getGenericErrorMessage(context)
    }
    
    // Map common error patterns to user-friendly messages
    const errorMappings = {
      // Authentication errors
      'invalid credentials': 'Invalid email or password. Please try again.',
      'invalid email or password': 'Invalid email or password. Please try again.',
      'access denied': 'Your account is not authorized. Please contact your administrator.',
      'not authorized': 'Your account is not authorized. Please contact your administrator.',
      
      // Network errors
      'fetch failed': 'Network error. Please check your connection and try again.',
      'network error': 'Network error. Please check your connection and try again.',
      'connection failed': 'Unable to connect to server. Please try again later.',
      
      // Registration errors
      'email already exists': 'An account with this email already exists. Please try logging in instead.',
      'required fields': 'Please fill in all required fields.',
      'passwords don\'t match': 'Passwords do not match. Please try again.',
      
      // QR/Scanning errors
      'qr code deactivated': 'This QR code was recently scanned. Please wait before scanning again.',
      'user not found': 'Invalid QR code or user not found in system.',
      'invalid qr': 'Invalid QR code format. Please try again.',
      
      // General errors
      'server error': 'Server error. Please try again later.',
      'internal server error': 'Server error. Please try again later.',
      'timeout': 'Request timed out. Please try again.'
    }
    
    // Check for matching patterns
    const lowerMessage = message.toLowerCase()
    for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
      if (lowerMessage.includes(pattern)) {
        return friendlyMessage
      }
    }
    
    // If no pattern matches and it's a reasonable user message, return it
    if (this.isUserFriendlyMessage(message)) {
      return message
    }
    
    // Fallback to generic message
    return this.getGenericErrorMessage(context)
  }
  
  /**
   * Check if an error message is technical and should be hidden from users
   * @param {string} message - Error message to check
   * @returns {boolean} True if this is a technical error
   */
  static isTechnicalError(message) {
    const technicalPatterns = [
      'webpack',
      'imported_module',
      'is not a function',
      'undefined is not',
      'cannot read property',
      'cannot read properties',
      'syntaxerror',
      'referenceerror',
      'typeerror',
      'module not found',
      '__webpack',
      'chunk',
      'hydration'
    ]
    
    const lowerMessage = message.toLowerCase()
    return technicalPatterns.some(pattern => lowerMessage.includes(pattern))
  }
  
  /**
   * Check if a message is already user-friendly
   * @param {string} message - Message to check
   * @returns {boolean} True if the message is user-friendly
   */
  static isUserFriendlyMessage(message) {
    // User-friendly messages are typically:
    // - Not too long
    // - Don't contain technical terms
    // - Are properly capitalized
    // - Don't contain file paths or stack traces
    
    if (!message || message.length > 200) return false
    if (this.isTechnicalError(message)) return false
    if (message.includes('/') && message.includes('.')) return false // Likely a file path
    if (message.includes('at ') && message.includes(':')) return false // Likely a stack trace
    
    return true
  }
  
  /**
   * Get a generic error message based on context
   * @param {string} context - The context where the error occurred
   * @returns {string} Generic error message
   */
  static getGenericErrorMessage(context) {
    const contextMessages = {
      login: 'Login failed. Please check your credentials and try again.',
      registration: 'Registration failed. Please check your information and try again.',
      signup: 'Account creation failed. Please try again.',
      scan: 'QR scan failed. Please try again.',
      save: 'Failed to save changes. Please try again.',
      load: 'Failed to load data. Please refresh and try again.',
      update: 'Update failed. Please try again.',
      delete: 'Delete failed. Please try again.',
      upload: 'Upload failed. Please try again.',
      download: 'Download failed. Please try again.'
    }
    
    return contextMessages[context] || 'Something went wrong. Please try again.'
  }
  
  /**
   * Log error for debugging while showing user-friendly message
   * @param {Error|string} error - The original error
   * @param {string} context - The context where the error occurred
   * @param {string} userMessage - The user-friendly message that was shown
   */
  static logError(error, context, userMessage) {
    console.group(`🚫 Error in ${context}`)
    console.error('Original error:', error)
    console.info('User message:', userMessage)
    console.groupEnd()
  }
  
  /**
   * Handle error with toast notification and console logging
   * @param {Error|string} error - The error to handle
   * @param {string} context - The context where the error occurred
   * @param {Function} toast - Toast notification function
   * @param {Function} setError - State setter for error display (optional)
   */
  static handleError(error, context, toast, setError = null) {
    const userMessage = this.formatUserError(error, context)
    
    // Show toast notification
    if (toast) {
      toast.error('Error', {
        description: userMessage
      })
    }
    
    // Set error state if setter provided
    if (setError) {
      setError(userMessage)
    }
    
    // Log for debugging
    this.logError(error, context, userMessage)
    
    return userMessage
  }
}

export default ErrorHandler

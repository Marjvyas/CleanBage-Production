// Authentication and authorization service
export class AuthService {
  static async authenticateUser(credentials) {
    const { email, password, role = "user" } = credentials
    
    try {
      // Make API call to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed')
      }
      
      return result.data.user
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }
  
  static async registerUser(userData) {
    const { email, password, name, society, phone, role } = userData
    
    // Validate required fields
    if (!email || !password || !name) {
      throw new Error("Please fill in all required fields")
    }
    
    // For collector registration, require additional verification
    if (role === "collector") {
      throw new Error("Collector registration requires community admin approval. Please contact your community administrator to become an authorized collector.")
    }
    
    try {
      // Make API call to register user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "user", // New registrations are always regular users
          society: society || "Default Society",
          phone
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }
      
      const newUser = result.data.user
      console.log("New user registered:", newUser)
      
      return {
        ...newUser,
        selectedRole: "user",
        canSwitchRoles: false
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }
  
  static async findUserByEmail(email) {
    // Check mock users
    const mockEmails = [
      "user@cleanbage.com",
      "collector@cleanbage.com", 
      "both@cleanbage.com",
      "unauthorized@cleanbage.com"
    ]
    
    if (mockEmails.includes(email)) {
      return { email }
    }
    
    // Check registered users
    const registeredUsers = this.getRegisteredUsers()
    const registeredUser = registeredUsers.find(user => user.email === email)
    
    return registeredUser || null
  }
  
  static isAuthorizedCollector(user) {
    return user.isAuthorized && 
           (user.role === "collector" || user.role === "both") &&
           user.collectorId
  }
  
  static getAvailableRoles(user) {
    const roles = ["user"]
    
    if (this.isAuthorizedCollector(user)) {
      roles.push("collector")
    }
    
    return roles
  }
  
  static async verifyCollectorAuthorization(collectorId) {
    // In a real app, this would verify with community database
    const authorizedCollectors = [
      "COL001",
      "COL002",
      "COL003"
    ]
    
    return authorizedCollectors.includes(collectorId)
  }
  
  static validatePassword(password) {
    // Password validation rules
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }
    return true
  }
  
  static validateEmail(email) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address")
    }
    return true
  }

  // Helper methods for managing registered users in localStorage
  static getRegisteredUsers() {
    try {
      const users = localStorage.getItem('registeredUsers')
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error("Error reading registered users:", error)
      return []
    }
  }

  static saveRegisteredUser(user) {
    try {
      const existingUsers = this.getRegisteredUsers()
      const updatedUsers = [...existingUsers, user]
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
    } catch (error) {
      console.error("Error saving registered user:", error)
      throw new Error("Failed to save user registration")
    }
  }

  static updateRegisteredUser(updatedUser) {
    try {
      const users = this.getRegisteredUsers()
      const userIndex = users.findIndex(user => user.id === updatedUser.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem('registeredUsers', JSON.stringify(users))
      }
    } catch (error) {
      console.error("Error updating registered user:", error)
    }
  }
}

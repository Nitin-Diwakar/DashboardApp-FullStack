class UserService {
  constructor() {
    // In-memory storage for users (in production, use MongoDB)
    this.users = [];
  }

  // Add or update user
  addOrUpdateUser(userData) {
    const { userId, email, name, phone } = userData;
    
    const existingUserIndex = this.users.findIndex(user => user.userId === userId);
    
    if (existingUserIndex !== -1) {
      // Update existing user
      this.users[existingUserIndex] = {
        ...this.users[existingUserIndex],
        email,
        name,
        phone,
        updatedAt: new Date()
      };
      console.log('📝 Updated user:', email);
    } else {
      // Add new user
      this.users.push({
        userId,
        email,
        name,
        phone,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('👤 Added new user:', email);
    }
  }

  // Get user by userId
  getUser(userId) {
    return this.users.find(user => user.userId === userId);
  }

  // Get all users with phone numbers
  getUsersWithPhones() {
    return this.users.filter(user => user.phone);
  }

  // Get user by email
  getUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  // Remove user
  removeUser(userId) {
    const index = this.users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      const removedUser = this.users.splice(index, 1)[0];
      console.log('🗑️ Removed user:', removedUser.email);
      return removedUser;
    }
    return null;
  }

  // Get all users
  getAllUsers() {
    return this.users;
  }

  // Stats
  getStats() {
    const totalUsers = this.users.length;
    const usersWithPhone = this.users.filter(user => user.phone).length;
    
    return {
      totalUsers,
      usersWithPhone,
      usersWithoutPhone: totalUsers - usersWithPhone
    };
  }
}

module.exports = new UserService();
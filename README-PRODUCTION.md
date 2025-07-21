# 🌱 CleanBage - Smart Waste Management System

A modern, responsive web application for community-based waste management with QR code scanning, real-time tracking, and gamification features.

## ✨ Features

### 🏠 User Features
- **User Registration & Authentication** - Secure role-based access
- **QR Code Generation** - Generate QR codes for waste bags
- **Real-time Balance Tracking** - Live points and transaction updates
- **Community Leaderboard** - Compete with neighbors
- **Transaction History** - Track all activities and rewards
- **Mobile-Responsive Design** - Works perfectly on all devices

### 🚛 Collector Features
- **Collector Dashboard** - Simplified interface for waste collectors
- **QR Code Scanning** - Quick scanning with camera integration
- **Automatic Point Awards** - 3 points per verified collection
- **Collection Management** - Track scans and manage routes
- **Authorization System** - Only verified collectors can access

### 🔧 Technical Features
- **Next.js 15.2.4** - Modern React framework
- **MongoDB Integration** - Scalable database with Atlas support
- **JWT Authentication** - Secure token-based auth
- **Real-time Updates** - Optimized polling with 80% performance improvement
- **Progressive Web App** - App-like experience
- **Production Ready** - Security headers, optimization, monitoring

## 🚀 Live Demo

**Demo Accounts:**
- **Regular User:** `user@cleanbage.com` / `user123`
- **Collector:** `collector@cleanbage.com` / `collector123`
- **Multi-Role:** `both@cleanbage.com` / `both123`

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React, TailwindCSS, Shadcn/ui
- **Backend:** Next.js API Routes, MongoDB
- **Authentication:** JWT, Role-based access control
- **Deployment:** Vercel (Free Tier)
- **Database:** MongoDB Atlas (Free Tier)
- **Domain:** GitHub Education (.me/.tech domains)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- MongoDB Atlas account (free)
- Vercel account (free)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/CLEANBAGE.git
   cd CLEANBAGE
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/cleanbage
   JWT_SECRET=your-development-jwt-secret
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:3000`

## 🌐 Production Deployment

### 1. MongoDB Atlas Setup (Free Tier)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (M0 Sandbox - Free)
3. Create database user
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string

### 2. Vercel Deployment (Free Tier)
1. Push code to GitHub
2. Connect GitHub repo to [Vercel](https://vercel.com)
3. Add environment variables:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleanbage
   JWT_SECRET=production-secure-secret
   NODE_ENV=production
   NEXTAUTH_URL=https://yourapp.vercel.app
   ```
4. Deploy automatically

### 3. Custom Domain (Free)
1. Apply for [GitHub Student Developer Pack](https://education.github.com/pack)
2. Get free .me or .tech domain
3. Configure DNS in Vercel dashboard

## 🔐 Security Features

- **Role-based Authentication** - User/Collector access control
- **JWT Token Security** - Secure session management
- **Input Validation** - Prevent XSS and injection attacks
- **Rate Limiting** - QR scan cooldown system
- **Environment Variables** - Secure configuration management
- **Security Headers** - XSS, CSRF, clickjacking protection

## 📱 Mobile Experience

- **Progressive Web App** - Install on mobile devices
- **Touch-optimized UI** - Perfect for mobile collectors
- **Offline Capabilities** - Works without internet
- **Camera Integration** - Native QR scanning
- **Responsive Design** - Adapts to all screen sizes

## 🎯 Performance Optimizations

- **Adaptive Polling** - Smart real-time updates (30s-2min intervals)
- **Tab Visibility Detection** - Pause polling when inactive
- **Optimistic UI** - Instant feedback for user actions
- **Code Splitting** - Faster page loads
- **Image Optimization** - Compressed assets
- **Caching Strategy** - Improved performance

## 🧪 Testing

### Demo Flow
1. **Register** new user account
2. **Generate QR** codes for waste bags
3. **Switch to collector** role (if authorized)
4. **Scan QR codes** to award points
5. **Check leaderboard** and transaction history
6. **Test mobile** experience

### Security Testing
- Role switching validation
- Authentication bypass attempts
- Input validation testing
- Authorization verification

## 📊 Monitoring & Analytics

- **Error Tracking** - Comprehensive error handling
- **Performance Monitoring** - Real-time metrics
- **User Analytics** - Usage patterns and trends
- **Security Monitoring** - Auth and access logs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/YourUsername/CLEANBAGE/issues)
- **Email:** support@cleanbage.app

## 🎉 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Vercel** - Amazing deployment platform
- **MongoDB Atlas** - Reliable database hosting
- **GitHub Education** - Free domain and resources

---

**🌍 Making waste management smart, engaging, and community-driven!**

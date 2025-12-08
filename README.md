# 💰 CashCompass

A beautiful, modern personal finance tracker built with Next.js 15, featuring a premium glassmorphism UI, real-time data sync, and powerful analytics.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)

## ✨ Features

### 📊 Dashboard
- **Real-time Financial Overview** - Total balance, income, expenses, and savings rate
- **Interactive Charts** - Income vs Expense trends with Recharts
- **Expense Breakdown** - Pie chart visualization by category
- **Spending Heatmap** - Visualize spending patterns by day/time
- **Spending Insights** - AI-powered anomaly detection and trends
- **Achievements System** - Gamified financial milestones
- **3D Tilt Cards** - Premium hover effects on all components

### 💳 Accounts
- Multi-account support (Bank, Credit Card, Cash, Investment)
- Multi-currency support (USD, EUR, IDR, and more)
- Real-time balance tracking
- Credit card visual display

### 💸 Transactions
- Income & Expense tracking
- Category assignment with icons
- Smart filters (date, amount, category, account)
- CSV Import/Export for bank statements
- Tag system for organization

### 📁 Categories
- Custom income & expense categories
- Icon picker with 50+ icons
- Color customization
- Usage analytics

### 📈 Budgets
- Monthly budget creation per category
- Progress tracking with visual indicators
- Overspending alerts
- Budget vs actual comparison

### 🎯 Financial Goals
- Savings goal tracker
- Progress visualization
- Target date setting
- Celebration confetti when goals are reached! 🎉

### 📅 Transaction Calendar
- Monthly calendar view
- Daily transaction summary
- Income/expense indicators
- Heat map activity visualization

### 📊 Reports & Analytics
- Time-based filtering (7d, 30d, 90d, 12m, All)
- Category spending breakdown
- Daily spending patterns
- Top expenses ranking
- CSV export functionality

### 🎆 Year in Review
- Annual financial summary
- Animated slideshow presentation
- Best/worst month highlights
- Savings rate analysis

## 🎨 UI/UX Features

- **Glassmorphism Design** - Modern frosted glass aesthetic
- **Dark/Light Mode** - System-aware theme switching
- **iOS-inspired Animations** - Smooth, buttery transitions
- **3D Tilt Effects** - Interactive card hover effects
- **Page Transitions** - Framer Motion powered navigation
- **Skeleton Loading** - Premium shimmer effects
- **Empty State Illustrations** - Beautiful animated placeholders
- **Responsive Design** - Mobile-first, works on all devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Clerk |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **State Management** | Zustand |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JeffZl/CashCompass.git
   cd CashCompass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```

4. **Run Supabase migrations**
   - Go to your Supabase SQL Editor
   - Run the migrations in `supabase/migrations/`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cashcompass/
├── app/
│   ├── (routes)/           # Protected routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── accounts/       # Account management
│   │   ├── transactions/   # Transaction list
│   │   ├── categories/     # Category management
│   │   ├── budgets/        # Budget tracking
│   │   ├── goals/          # Financial goals
│   │   ├── reports/        # Analytics & reports
│   │   ├── calendar/       # Transaction calendar
│   │   └── settings/       # User settings
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── dashboard/          # Dashboard widgets
│   ├── transactions/       # Transaction components
│   ├── ui/                 # Reusable UI components
│   └── ...
├── lib/
│   ├── supabase/           # Database hooks & client
│   ├── stores/             # Zustand stores
│   ├── currency.ts         # Currency utilities
│   └── export.ts           # CSV export utilities
└── supabase/
    └── migrations/         # Database migrations
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- User data isolation - each user only sees their own data
- Clerk authentication with secure session management
- No sensitive data in client-side storage

## 📱 PWA Support

CashCompass is a Progressive Web App! You can install it on:
- **Desktop** (Chrome, Edge) - Click the install icon in the address bar
- **Android** - "Add to Home Screen" from Chrome menu  
- **iOS** - "Add to Home Screen" from Safari share menu

## 🚧 Upcoming Features

- [ ] Push Notifications for bill reminders
- [ ] Recurring Transactions
- [ ] Bank Account Sync (Plaid integration)
- [ ] Investment Portfolio Tracking
- [ ] Receipt Scanning with OCR
- [ ] Multi-language Support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ using Next.js and Supabase
</p>

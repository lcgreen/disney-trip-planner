# 🏰 Disney Trip Planner - Your Magical Journey Starts Here

A comprehensive Disney vacation planning suite built with React, Next.js, and Tailwind CSS. Plan your perfect Disney adventure with our interactive tools designed to make your trip magical and stress-free!

## ✨ Features

### 🕒 Disney Countdown Timer
- **Multi-park support**: Choose from Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Disneyland, and Disneyland Paris
- **Real-time countdown**: Live updates showing days, hours, minutes, and seconds until your trip
- **Park-specific themes**: Beautiful gradients and styling for each Disney destination
- **Planning tips**: Helpful reminders for 60, 30, 7, and 1 day milestones

### 📅 Trip Planner (Premium)
- **Day-by-day itineraries**: Plan detailed schedules for each day of your trip
- **Activity management**: Add attractions, dining, shows, and custom activities
- **Priority system**: Mark activities as high, medium, or low priority
- **Time-based organization**: Automatic sorting by time for optimal planning
- **Notes and locations**: Add detailed notes and specific locations for each activity

### 💰 Budget Tracker (Premium)
- **Category-based budgeting**: Track expenses across tickets, accommodation, dining, transport, shopping, and extras
- **Real-time progress**: Visual progress bars and percentage tracking
- **Expense logging**: Add actual expenses with estimates and categories
- **Money-saving tips**: Built-in advice for saving money on your Disney vacation
- **Visual insights**: Beautiful charts and progress indicators

### 📦 Packing Checklist
- **Weather-adaptive lists**: Items adjust based on expected weather conditions
- **Category organization**: Clothing, electronics, toiletries, documents, Disney essentials, and more
- **Essential item marking**: Clearly marked must-have items
- **Progress tracking**: Visual completion statistics
- **Custom items**: Add your own items to personalize your list

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd disney-countdown
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000` (or `http://localhost:3001` if 3000 is in use)

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Disney-themed design system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for beautiful, consistent icons
- **Date Handling**: date-fns for reliable date calculations

## 🎨 Design System

### Disney Color Palette
- **Disney Blue**: `#003087` - Classic Disney brand color
- **Disney Gold**: `#FFD700` - Magical golden accent
- **Disney Red**: `#CE1126` - Bold action color
- **Park-specific colors**: Unique gradients for each Disney park

### Typography
- **Primary**: Poppins (clean, modern)
- **Disney Headings**: Fredoka One (playful, magical)
- **Monospace**: For countdown timers and time displays

### Animations
- **Sparkle effects**: Magical twinkling animations
- **Float animations**: Gentle floating elements
- **Smooth transitions**: 300ms duration for interactions

## 💎 Premium Features

The app includes a freemium model with:

### Free Features
- Disney Countdown Timer
- Packing Checklist
- Basic planning tips

### Premium Features (£9.99/month)
- Advanced Trip Planner
- Comprehensive Budget Tracker
- Priority support
- Unlimited trip planning

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Disney theme
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage with tool selection
├── components/            # React components
│   ├── CountdownTimer.tsx # Disney countdown functionality
│   ├── TripPlanner.tsx    # Trip planning interface
│   ├── BudgetTracker.tsx  # Budget management
│   └── PackingChecklist.tsx # Packing list manager
└── types/                 # TypeScript type definitions
```

## 🎯 Revenue Model

### Subscription Tiers
- **Free Tier**: Basic countdown and packing tools
- **Premium Tier**: £9.99/month for full planning suite

### Monetization Strategies
1. **Freemium subscriptions**: Core revenue stream
2. **Affiliate marketing**: Disney merchandise and booking partnerships
3. **Premium templates**: Specialized planning templates
4. **Disney vacation packages**: Partner with travel agencies

### Target Revenue
- **Goal**: £1,000+ per month
- **100 subscribers** at £9.99/month = £999/month
- **Additional affiliate revenue**: £200-500/month estimated

## 🚀 Deployment

The application is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎭 Disney Legal Notice

This project is a fan-made planning tool and is not affiliated with, endorsed by, or sponsored by The Walt Disney Company. All Disney park names and references are used for informational purposes only.

## 📞 Support

For support, feature requests, or bug reports, please open an issue in the GitHub repository.

---

**Built with ❤️ for Disney fans everywhere** ✨🏰✨ 
# 💊 Medi-Reminder - Medicine Reminder & Scheduler

A comprehensive healthcare mobile and web application that helps users manage their medications with smart reminders, dosage tracking, and pharmacy delivery integration.

![Medicine Reminder](https://img.shields.io/badge/React%20Native-v0.72-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)

## 🌟 Features

### 📱 Core Functionality
- ✅ **Add & Manage Medicines** - Easy-to-use form for adding medications
- ✅ **Smart Scheduling** - Set multiple daily doses (1-4 times or custom)
- ✅ **Color-Coded System** - Visual identification with 8 color options
- ✅ **Stock Tracking** - Monitor medication levels with progress bars
- ✅ **Daily Schedule View** - See all medications at a glance

### 🔔 Notifications
- ⏰ **Scheduled Reminders** - Automatic alerts at medication times
- 📲 **Refill Alerts** - Get notified 3 days before refill date
- 🎯 **Action Buttons** - Take, Skip, or Snooze from notification

### 🏥 Pharmacy Integration
- 📦 **Order Medicines** - Order directly from partnered pharmacies
- 🚚 **Track Deliveries** - Real-time order status updates
- ⭐ **Compare Pharmacies** - See ratings and delivery times
- 💰 **Price Transparency** - View costs before ordering

### 📊 Analytics
- 📈 **Adherence Tracking** - Monitor medication compliance
- 📅 **Schedule History** - View past taken/missed doses
- 🎯 **Statistics Dashboard** - Quick overview of medications

## 🚀 Live Demo

**Try it now:** [https://medi-reminder.vercel.app](https://medi-reminder.vercel.app)

## 📱 Run on Your Phone

1. **Install Expo Go:**
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR Code:** (Generate by running `npm start`)

3. **Instant Access:** App loads directly on your device!

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Storage:** AsyncStorage (local-first)
- **Notifications:** Expo Notifications
- **Styling:** Custom design system
- **Date Handling:** date-fns
- **API:** Axios

## 📦 Installation

### Prerequisites
- Node.js v16+
- npm or yarn
- Expo CLI

### Quick Start

```bash
# Clone repository
git clone https://github.com/Niyas-J/Medi-Reminder.git
cd Medi-Reminder

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (Mac only)
npm run web      # Web browser
```

## 📁 Project Structure

```
MediReminderApp/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── MedicineCard.tsx
│   ├── screens/          # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── AddMedicineScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   └── PharmacyScreen.tsx
│   ├── services/         # Business logic & APIs
│   │   ├── notificationService.ts
│   │   └── apiService.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   └── theme/            # Design system
│       ├── colors.ts
│       └── styles.ts
├── App.tsx               # Main app component
└── package.json          # Dependencies
```

## 🎨 Screenshots

### Home Screen
- Medicine list with color-coding
- Statistics dashboard
- Quick add button

### Schedule View
- Daily medication timeline
- Take/Skip actions
- Adherence statistics

### Pharmacy
- Low stock alerts
- Order placement
- Delivery tracking

## 🔧 Configuration

### API Integration
Update `src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'YOUR_BACKEND_URL';
```

### Theme Customization
Edit `src/theme/colors.ts`:
```typescript
export const colors = {
  primary: '#4A90E2',  // Your brand color
  // ... more colors
};
```

## 📱 Features by Screen

### 🏠 Home Screen
- View all medicines
- Statistics cards (Active, Today's Doses, Refills)
- Add new medicine (FAB button)
- Edit/Delete medicines

### ➕ Add Medicine Screen
- Medicine name & dosage
- Frequency selection (1-4x daily)
- Time picker for each dose
- Stock management
- Color tag selection
- Optional instructions

### 📅 Schedule Screen
- Date navigation
- Daily schedule view
- Mark as taken/skipped
- Statistics (Total, Taken, Skipped, Missed)

### 🏥 Pharmacy Screen
- Low stock medicine alerts
- Order placement modal
- Pharmacy selection
- Order history & tracking

## 🔐 Security & Privacy

- Local data encryption
- Secure API calls (HTTPS)
- No sensitive data in notifications
- User data control

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📈 Roadmap

- [ ] Health device integration
- [ ] Medication interaction warnings
- [ ] Family member management
- [ ] Doctor appointment sync
- [ ] Prescription photo upload
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Cloud sync

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Niyas J**
- GitHub: [@Niyas-J](https://github.com/Niyas-J)

## 🙏 Acknowledgments

- Design inspiration from modern healthcare apps
- Icons from emoji set
- Built with ❤️ for better healthcare management

## 📧 Support

For support, please open an issue on GitHub or contact via email.

---

**Made with ❤️ for better healthcare management**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Niyas-J/Medi-Reminder)


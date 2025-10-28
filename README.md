# 📱 Turf Booking App - React Native

A complete mobile application for booking sports turfs, professionally converted from React web app to React Native using Expo and TypeScript.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Framework](https://img.shields.io/badge/Framework-React%20Native-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Expo](https://img.shields.io/badge/Expo-Latest-000020)

## Features

### User Features
- ✅ Phone number authentication with OTP
- ✅ Browse available turfs
- ✅ View turf details with pricing
- ✅ Book time slots
- ✅ View booking history
- ✅ Cancel bookings
- ✅ User profile management

### Admin Features
- ✅ Admin dashboard (placeholder)
- ✅ Manage turfs (placeholder)
- ✅ View all bookings (placeholder)
- ✅ Manage time slots and pricing (placeholder)

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: React Context API + Zustand
- **API Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: Custom components with StyleSheet
- **Icons**: React Native Vector Icons (Ionicons)
- **Date Handling**: date-fns
- **OTP Input**: react-native-otp-entry
- **Notifications**: react-native-toast-message

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator or Android Emulator (optional)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd TurfBookingApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Project Structure

```
TurfBookingApp/
├── App.tsx                 # Main app entry point
├── src/
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── UserNavigator.tsx
│   │   └── AdminNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── auth/
│   │   │   ├── PhoneEntryScreen.tsx
│   │   │   └── OTPVerificationScreen.tsx
│   │   ├── user/
│   │   │   ├── TurfListScreen.tsx
│   │   │   ├── TurfDetailScreen.tsx
│   │   │   ├── MyBookingsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── admin/
│   │       └── AdminNavigator.tsx (with placeholders)
│   ├── components/         # Reusable components
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── LoadingState.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── constants/          # App constants
│   │   ├── colors.ts
│   │   └── config.ts
│   └── utils/              # Utility functions
└── package.json
```

## API Configuration

The app connects to the backend API at:
```
http://turfbackend-env.eba-yrja2qmi.ap-south-1.elasticbeanstalk.com
```

You can change this in `src/constants/config.ts`.

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## Key Differences from Web Version

1. **Components**: Uses React Native components (`View`, `Text`, `TouchableOpacity`) instead of HTML elements
2. **Styling**: Uses `StyleSheet.create()` instead of Tailwind CSS
3. **Navigation**: Uses React Navigation instead of React Router
4. **Storage**: Uses AsyncStorage instead of localStorage
5. **Icons**: Uses react-native-vector-icons instead of lucide-react
6. **Forms**: Uses `TextInput` with different props
7. **Safe Areas**: Uses `SafeAreaView` for device notches/status bars

## Building for Production

### Using EAS (Expo Application Services)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android
   ```

5. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

## Testing

- Test authentication flow with OTP
- Test turf listing and details
- Test booking creation and cancellation
- Test on both iOS and Android devices
- Test with different screen sizes

## Future Enhancements

- [ ] Complete admin dashboard screens
- [ ] Add image picker for turf photos
- [ ] Implement push notifications
- [ ] Add maps integration for turf location
- [ ] Add payment gateway integration
- [ ] Add booking confirmation emails/SMS
- [ ] Implement search and filters
- [ ] Add dark mode support
- [ ] Add offline support with local caching

## Troubleshooting

### Metro Bundler Issues
```bash
npx expo start -c
```

### Dependencies Issues
```bash
rm -rf node_modules
npm install
```

### iOS Simulator Not Opening
```bash
npx expo run:ios
```

### Android Build Errors
Make sure you have Android Studio and SDK installed properly.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For issues or questions, please create an issue in the repository.

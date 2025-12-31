# ShelfLife Mobile App

ShelfLife is a modern, feature-rich mobile application built from scratch using **React Native**, **Expo**, and **NativeWind**. It provides a seamless platform for users to list items, communicate in real-time, and manage their interactions efficiently.

## 📱 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 52)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing for React Native.
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) - Utility-first styling system.
- **Authentication:** [Clerk](https://clerk.com/) - Secure and easy-to-integrate authentication.
- **Icons:** [Lucide React Native](https://lucide.dev/) & Expo Vector Icons.
- **State Management:** React Context & Hooks.
- **Networking:** Axios for API requests.

## ✨ Key Features

- **User Accounts:** Secure login and signup flows via Clerk.
- **Item Listings:** Browse, search, and post items with ease.
- **Real-time Chat:** Integrated messaging system for buyer-seller communication.
- **Location Services:** Location-based features using Expo Location.
- **Notifications:** Push notifications for updates and messages.
- **Media:** Image picking and audio capabilities.
- **Modern UI/UX:** Clean, responsive design using Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo Go app on your physical device (iOS/Android) or an emulator.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ShelfLife
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory. You will need your Clerk publishable key and your backend API URL.
    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    EXPO_PUBLIC_API_URL=http://your-backend-ip:3000
    ```

4.  **Run the App:**
    Start the development server:
    ```bash
    npm start
    ```
    - **Scan the QR code** with the Expo Go app (Android) or Camera app (iOS).
    - Press `a` to open in Android Emulator.
    - Press `i` to open in iOS Simulator.
    - Press `w` to open in Web.

## 📂 Project Structure

- `app/`: Application screens and navigation (Expo Router).
- `components/`: Reusable UI components.
- `assets/`: Images, fonts, and other static assets.
- `services/`: API and external service integrations.
- `store/`: State management logic.
- `utils/`: Helper functions and constants.

## 🤝 Contributing

This project was built with passion and attention to detail. If you'd like to contribute, please fork the repository and submit a pull request!

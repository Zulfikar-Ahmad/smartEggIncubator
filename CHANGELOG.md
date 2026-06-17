# Changelog

All notable changes to this project will be documented in this file.

## [v1.3.2] - Light & Dark Mode, Account Management
### Added
- System/Light/Dark mode theme toggle.
- Clear History feature on the History page.
- Delete Account feature on the User Management page.

## [v1.3.1] - Stability Patches
### Fixed
- Fixed bug where camera status was stuck on "CONNECTING..." due to MQTT retained message drops. LiveCam now sets a 3-second timeout.

## [v1.3.0] - Live Camera Integration
### Added
- Real-time video streaming from ESP32-CAM via WebSockets.
- Flashlight toggle control to activate the ESP32-CAM flash.
- Camera Resolution dropdown control (ranging from UXGA to QQVGA).
- Photo Capture button to download a frame directly from the video stream.

## [v1.2.0] - Smart Incubator Dashboard
### Added
- Real-time Temperature and Humidity charts with Min, Max, and Avg calculations.
- Manual Motor controls (Trigger Motor instantly).
- Automatic Motor Interval adjustment (dropdown control from 1 to 240 minutes).
- ESP32 Connection Tracker (Dashboard detects when the device is offline/online).
- Responsive grid layout for monitoring devices.

## [v1.1.0] - Authentication & User Profiles
### Added
- Email & Password Authentication flow with Firebase.
- Added "Remember Me" session persistence logic during login.
- Registration fields expanded to require First Name, Last Name, and Username.
- Existing User Profile Completion Modal on login.
- User Management settings page to update names and usernames.
- Username-to-email login resolution.

## [v1.0.0] - Initial MVP Setup
### Added
- Initial React application architecture with Vite.
- Tailwind CSS framework setup and styling foundation.
- Firebase integration and structural database rules.
- Sidebar and Top Navigation components.

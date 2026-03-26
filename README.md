# 🛠️ Gunter Management System

<p align="center">
  <img src="public/assets/readme/banner.png" alt="Gunter Banner" width="800">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0-blue.svg?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Tech-React_%2B_Electron-61DAFB?style=for-the-badge&logo=react" alt="Tech">
  <img src="https://img.shields.io/badge/Database-Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Database">
</p>

---

### 🌟 Overview

**Gunter** is a premium workshop management solution designed for modern mechanical businesses and spare part stores. It combines a state-of-the-art user interface with robust security and real-time cloud synchronization. Originally built to streamline operations, it now serves as a comprehensive ERP for automotive service centers.

<p align="center">
  <img src="public/assets/readme/mockup.png" alt="Gunter Dashboard" width="700">
</p>

---

### 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🌍 Multi-language** | Seamless toggle between **Arabic** and **English** with full RTL support and localized calendars. |
| **📈 Operations Hub** | Real-time tracking of sales, payments, and debts with detailed history and matching logic. |
| **📦 Smart Inventory** | Automated stock monitoring with low-inventory alerts and threshold management. |
| **👥 CRM** | Centralized customer database with automated balance tracking and transaction logs. |
| **🧾 Professional Receipts** | Customizable thermal receipt printing with business branding. |
| **🔒 Advanced Security** | Tiered access control (User/Admin) and encrypted background license validation. |
| **☁️ Firestore Sync** | Real-time cloud synchronization for operations, customers, and licensing. |

---

### 🆕 What's New in v1.1.0

- **📅 Localized Date Picker**: Fully internationalized calendar with Arabic/English month and day names.
- **🔍 Smart Matching**: Enhanced customer identification logic that handles Arabic character variations (Normalization).
- **🛡️ Secure Build**: Improved production build process for Windows with NSIS installer support.
- **✨ UI Polish**: Refined dropdown menus with smart-flipping logic to prevent screen clipping in tables.

---

### 🔑 Trial Access

You can test the system using the following temporary license key:
- **Key:** `511A3E35-9203-410D-B791-6888F1AFC8E4`
- **Limit:** 1 Hour per machine.
- **Note:** This key can be used multiple times, but each session is limited to one hour of activity. After the hour expires, the system will be locked, and you must contact the developer for a permanent key.

---

### 🛠️ Tech Stack

- **Frontend:** React 18 & Vite
- **Desktop Wrapper:** Electron
- **Backend/DB:** Firebase Firestore & Auth
- **Styling:** Modern Vanilla CSS (Glassmorphism & CSS Variables)
- **Icons:** Lucide-React

---

### 📦 Installation & Build

#### Development Environment
```bash
# Clone the repository
git clone https://github.com/TemRevil/gunter.git

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Launch Electron application
npm run electron
```

#### Production Build
```bash
# Generate the production installer (Setup.exe)
npm run electron:build
```
*Note: The setup executable will be generated in the `release/` directory.*

---

### 🔒 Security & Licensing

The system implements a multi-layered security architecture:
- **Administrative Protection**: Sensitive data (Settings/Deletions) requires Admin password override.
- **Transparent Auth**: Automatic background authentication secures the Firestore connection.
- **Hardware-Linked Licensing**: Activation keys are validated against unique IDs to prevent unauthorized distribution.

---

<p align="center">
  <i>Developed with ❤️ by <a href="https://temrevil.github.io/revil">Tem Revil</a> using Antigravity.</i>
</p>

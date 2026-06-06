# Toko Klontong - Cashier & Inventory Management 🛒

A complete, lightweight, offline-first Point of Sale (POS) and Inventory Management web application designed for small retail stores (Toko Kelontong). 

This app is built with **React** and **Vite**, featuring seamless, private **Google Drive Synchronization** for data backup across devices without needing a dedicated backend server!

## ✨ Features

- **Point of Sale (POS):** Fast and intuitive checkout system with a cart and barcode/SKU search.
- **Inventory Management:** Track your products, stock levels, selling prices, and **Cost Price (Modal)** for accurate profit calculation.
- **Transaction History:** View past sales receipts, filter by date or category, and see exactly how much profit you made.
- **Sales Analytics:** Interactive charts (Daily/Weekly/Monthly) to visualize your Revenue vs. Profit.
- **Offline-First:** All data is stored locally in your browser's `localStorage`. The app works perfectly even if your internet connection drops.
- **Google Drive Sync:** Users can log in with their Google account to securely and privately back up their store data directly to their own Google Drive (hidden app data folder).
- **Export to CSV:** Easily export your inventory data to a CSV file in your Google Drive.
- **Bilingual:** Fully supports English and Bahasa Indonesia.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A Google Cloud Project with the **Google Drive API** enabled and an OAuth 2.0 Client ID.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/your-username/toko-klontong.git
   cd toko-klontong
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
You can then deploy the `dist/` folder to any static hosting provider like Vercel, Netlify, GitHub Pages, or Firebase Hosting.

## 🔐 Privacy & Data
This app has **no centralized backend**. 
- When a user uses the app locally, data stays in their browser. 
- When they click "Connect Drive", the app uses the `drive.appdata` scope. This creates a hidden file inside the user's personal Google Drive to sync their store data.
- The developer of the app has **zero access** to the user's store data.

## 🛠 Tech Stack
- React 18
- Vite
- Recharts (Data Visualization)
- Google Identity Services (OAuth) & Google Drive API v3

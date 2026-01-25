# Firebase Integration Guide

This document explains how to set up Firebase for your portfolio.

## 🔧 Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Name your project (e.g., "portfolio-arcade")
4. Disable Google Analytics (optional)
5. Click **Create Project**

### Step 2: Enable Authentication

1. Go to **Build → Authentication**
2. Click **"Get Started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Enable **Google** (add your email as support email)

### Step 3: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** initially
4. Select a region close to you
5. After creation, go to **Rules** tab and paste contents from `firestore.rules`

### Step 4: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** and click **Web (`</>`)** icon
3. Register your app with a nickname (e.g., "portfolio-web")
4. Copy the config values to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 5: Set Up First Admin User

1. Sign in with Google on your portfolio
2. Go to Firebase Console → Firestore Database
3. Find your user in the `users` collection
4. Change the `role` field from `"player"` to `"admin"`

Now you can access `/admin` to configure your portfolio!

---

## 📁 File Structure

```
src/
├── lib/firebase/
│   ├── config.ts         # Firebase initialization
│   ├── auth.ts           # Authentication functions
│   ├── firestore.ts      # Database operations (game history, leaderboards)
│   ├── siteConfig.ts     # Site configuration management
│   └── index.ts          # Barrel exports
├── context/
│   ├── AuthContext.tsx   # Global auth state
│   └── SiteConfigContext.tsx  # Site configuration state
├── hooks/
│   └── useGameData.ts    # Game data operations hook
└── components/
    ├── auth/
    │   ├── AuthModal.tsx     # Login/signup modal
    │   ├── UserMenu.tsx      # User dropdown menu
    │   └── ProtectedRoute.tsx # Route guard
    └── game/
        └── Leaderboard.tsx   # Game leaderboard component
```

---

## 🎮 Using Game Data

### Save a Score

```tsx
import { useGameData } from '@/hooks/useGameData';
import { useAuth } from '@/context/AuthContext';

function GameComponent() {
  const { user } = useAuth();
  const { saveScore } = useGameData();

  const handleGameOver = async (score: number) => {
    if (user) {
      // Logged in - save to database
      await saveScore('flappy-bird', 'Flappy Bird', score, gameDuration);
    } else {
      // Guest - optionally save to localStorage
      const localScores = JSON.parse(localStorage.getItem('guestScores') || '[]');
      localScores.push({ gameId: 'flappy-bird', score, date: new Date() });
      localStorage.setItem('guestScores', JSON.stringify(localScores));
    }
  };
}
```

### Display Leaderboard

```tsx
import { Leaderboard } from '@/components/game';

function GamePage() {
  return (
    <Leaderboard 
      gameId="flappy-bird" 
      gameName="Flappy Bird" 
      limit={10} 
    />
  );
}
```

---

## 🔐 Role-Based Access Control (RBAC)

### Roles

- **admin**: Full access to admin dashboard and all data
- **player**: Can play games and save scores
- **guest**: Can play games but scores are not saved (unless localStorage is enabled)

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/auth';

function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### Checking Roles

```tsx
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, isAdmin, isPlayer, checkRole } = useAuth();

  if (isAdmin) {
    // Show admin features
  }
}
```

---

## 🎨 Dynamic Site Configuration

The admin dashboard at `/admin` allows you to configure:

- **General**: Site name, description, logo
- **Colors**: Primary, secondary, background, surface, text colors
- **Content**: Hero section, about section, skills
- **Games**: Guest play settings, leaderboard visibility
- **Social**: GitHub, LinkedIn, Twitter, email links

Colors are automatically applied as CSS custom properties:
- `--color-primary`
- `--color-secondary`
- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-text-muted`

Use them in your CSS:
```css
.button {
  background: var(--color-primary);
}
```

---

## ⚠️ Important Notes

1. **Environment Variables**: Never commit `.env.local` to git
2. **Security Rules**: Always deploy the Firestore rules from `firestore.rules`
3. **First Admin**: You must manually set the first admin in Firestore
4. **Guest Play**: Guests can play but their scores are not persisted to the database

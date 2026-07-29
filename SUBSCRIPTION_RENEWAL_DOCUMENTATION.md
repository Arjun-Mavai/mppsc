# 🚀 Subscription Renewal System — Technical Documentation & QA Guide

## 📌 Overview & Objective

This feature implements an end-to-end, automated **Subscription Renewal System** for the MPPSC platform. It ensures that users whose plans are expiring or expired are properly identified, warned via non-intrusive UI banners, and strictly redirected to a dedicated `/renew` interface before they can access standard dashboard features.

---

## 🧪 Test Accounts for QA Testing

The system includes pre-seeded test accounts in SQLite/Turso DB for local and staging validation.
All test accounts share the password: `password123`.

| Email                       | Account Status        | Days Remaining           | Target Behavior Upon Login                                                |
| :-------------------------- | :-------------------- | :----------------------- | :------------------------------------------------------------------------ |
| `expired@mppsc.test`        | 🔴 **Expired**        | `0` (Expired 5 days ago) | Immediate hard redirect to `/renew`. Dashboard access blocked.            |
| `expiring8@mppsc.test`      | 🟡 **Expiring Soon**  | `8 Days`                 | Lands on `/dashboard`. Shows Gold persistent Warning Banner at top.       |
| `combo.expiring@mppsc.test` | 🟡 **Combo Expiring** | `5 Days`                 | Lands on `/dashboard`. Displays `Pro+ Plan (Pre + Mains)` badge + banner. |

### Command to Re-Seed Test Accounts:

```bash
npm run db:seed:renewal
```

---

## 🛠️ Key Files Changed & Architectural Rationale

### 1. `src/lib/subscription-status.ts` _(Status Resolver Engine)_

- **Why**: Previously, if a user's plan tier was set to `'free'`, the function returned `isExpired: false` before checking `accessExpiresAt`.
- **How**: Updated `getSubscriptionStatus()` so `accessExpiresAt` is evaluated **first**. Any user with `accessExpiresAt < Date.now()` is marked `status: 'expired'`, `isExpired: true`, and `requiresRenewalRedirect: true`.

### 2. `src/components/signin.tsx` _(Client-Side Login Flow)_

- **Why**: Expired users logging in were being unconditionally sent to `/dashboard`.
- **How**: Integrated `getSubscriptionStatus()`. If `statusInfo.requiresRenewalRedirect` is `true`, `destination` is dynamically set to `/renew`.

### 3. `src/app/dashboard/page.tsx` _(Server-Side Redirect Guard)_

- **Why**: Users trying to bypass login redirects by directly navigating to `/dashboard` needed to be blocked at SSR level.
- **How**: Added server-side evaluation:
  ```ts
  const statusInfo = getSubscriptionStatus(user);
  if (statusInfo.requiresRenewalRedirect || statusInfo.isExpired) {
    redirect('/renew');
  }
  ```

### 4. `src/components/PWARouteTracker.tsx` _(PWA Auto-Resume Guard)_

- **Why**: PWA background auto-resume would teleport users to saved routes or `/dashboard`.
- **How**: Subscribed to Zustand `user` state and added top-level check: if expired, forces route to `/renew` and excludes `/renew` from tracking history.

### 5. `src/lib/access-grants.ts` _(Centralized Plan Display Helper)_

- **Why**: Plan names were inconsistent across pages.
- **How**: Implemented `getPlanDisplayName(user)` helper:
  - `Pre + Mains Grants` $\rightarrow$ **`Pro+ Plan (Pre + Mains)`** (Amber Golden Badge)
  - `Mains Only Grants` $\rightarrow$ **`Mains Pro Plan`** (Emerald Green Badge)
  - `Prelims Only Grants` $\rightarrow$ **`Prelims Pro Plan`** (Warm Amber Badge)

### 6. `src/app/renew/page.tsx` & `RenewClient.tsx` _(Renewal Interface)_

- **Why**: Dedicated renewal page displaying dynamic offer prices.
- **How**: Reads dynamic prices from DB `pricing_config`. Offers Combo at ₹499 (Original ₹599) as default tab, Mains at ₹399, and Prelims Pro at ₹299.

### 7. `src/components/subscription/RenewalWarningBanner.tsx` _(Persistent Nudge)_

- **Why**: Warn active users with $\le 10$ days left.
- **How**: Displays a sleek glassmorphism banner on `/dashboard` and `/profile` linking to `/renew`.

### 8. `src/actions/payment-actions.ts` _(Atomic Payment & Renewal Verification)_

- **Why**: Processing Razorpay payments safely and updating DB state.
- **How**: Executes an **Atomic DB Transaction** (`db.transaction`) updating 3 tables (`mppsc_users`, `payments`, `mppsc_user_activities`).

### 9. `src/components/layout/AppNavbar.tsx` _(Mobile Navigation)_

- **Why**: Easily accessible Profile link in mobile drawer sidebar.
- **How**: Added `{ name: 'Profile', href: '/profile', icon: User }` right after `About Us`.

---

## 🗄️ Database Schema & Production Migration

### Schema Updates (`src/db/schema.ts`):

- Added `renewalCount` (integer, default 0) to `mppsc_users`.
- Added `lastRenewedAt` (timestamp) to `mppsc_users`.
- Added `pricing_config` table for dynamic renewal pricing configuration (`renewal_combo_price`, `renewal_mains_price`, `renewal_pro_price`).

---

## 🔒 Security Audit & Safeguards

1. **HMAC-SHA256 Razorpay Signature Validation**: Uses `crypto.timingSafeEqual()` to prevent timing attacks.
2. **Price Anti-Tampering**: Verification compares paid amount against Razorpay API order details + server DB `pricing_config`.
3. **Session Safety**: `httpOnly`, `sameSite: 'lax'` cookie sessions with multi-device login protection.

---

## 🚀 Production Deployment Checklist

1. Run database schema migration:
   ```bash
   npx drizzle-kit push
   ```
2. Seed default pricing row in remote DB:
   ```bash
   npm run db:seed:renewal
   ```
3. Ensure Environment Variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are configured.

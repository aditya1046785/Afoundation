# Autopay Feature Setup - Final Steps

## 🎉 Implementation Complete

All code for the autopay donation feature has been implemented and fixed. The only remaining step is to apply the database migration.

---

## ⚙️ Required Setup Steps

### 1. **Apply Database Migration** (IMPORTANT)

This is the critical step that will make all TypeScript errors disappear:

```bash
cd /home/aditya/backup
npx prisma migrate dev --name "add autopay subscription"
```

This will:
- Create the `AutopaySubscription` table in your database
- Create `AutopayFrequency` and `AutopayStatus` enums
- Update Prisma client types to recognize the new model
- Resolve all TypeScript errors about `autopaySubscription` not existing

---

### 2. **Add Razorpay Webhook Secret** to `.env.local`

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key_from_razorpay_dashboard
```

Get this from Razorpay Dashboard:
- Go to Settings → API Keys
- Find the Webhook Secret
- Copy and add to your `.env.local`

---

### 3. **Configure Razorpay Webhook** in Dashboard

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. **Webhook URL**: `https://yoursite.com/api/autopay/webhook`
4. **Select Events**:
   - `subscription.charged`
   - `subscription.failed`
   - `subscription.paused`
   - `subscription.cancelled`
5. Save the webhook
6. Copy the Webhook Secret and add to `.env.local` (as shown above)

---

### 4. **Restart Development Server**

After applying the migration:

```bash
npm run dev
```

All errors should be resolved! ✅

---

## 📁 Files Created/Modified

### New Files:
- `src/components/public/DonationToggle.tsx` - Toggle slider UI
- `src/components/public/AutopayForm.tsx` - Autopay donation form
- `src/components/public/DonatePageContent.tsx` - Client wrapper with toggle state
- `src/app/api/autopay/create-subscription/route.ts` - Create subscription endpoint
- `src/app/api/autopay/verify-subscription/route.ts` - Verify subscription endpoint
- `src/app/api/autopay/webhook/route.ts` - Webhook handler for Razorpay events

### Modified Files:
- `prisma/schema.prisma` - Added AutopaySubscription model & enums
- `lib/validations.ts` - Added autopaySchema validation
- `src/app/(public)/donate/page.tsx` - Updated to use new components

---

## 🧪 Testing

After setup, test the feature:

1. Navigate to `/donate` page
2. You should see the **One-Time ↔ Autopay** toggle slider
3. Click on **Autopay** tab
4. Fill in the form:
   - Amount: ₹500+ (minimum ₹100)
   - Frequency: Weekly or Monthly
   - Donor details
5. Click "Start Monthly Donation"
6. Complete Razorpay checkout
7. Check database for:
   - `AutopaySubscription` record created
   - `Donation` record created

---

## 🔧 Troubleshooting

### Migration Fails with "Can't reach database server"
- Ensure your `DATABASE_URL` in `.env.local` is correct
- Check if Supabase/database service is running
- Verify network connectivity

### Webhook Not Working
- Confirm `RAZORPAY_WEBHOOK_SECRET` is correctly set
- Check Razorpay Dashboard logs for webhook delivery status
- Ensure your site URL is publicly accessible (ngrok for local testing)

### TypeScript Errors Still Appear
- Run: `npx prisma generate` to regenerate client
- Delete `node_modules/.prisma` folder and regenerate
- Restart VS Code TypeScript server (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

---

## 📚 Architecture Summary

```
Donate Page
  ├─ DonationToggle (Client State)
  ├─ One-Time Flow
  │  └─ DonateForm → /api/donations/create-order → Razorpay
  └─ Autopay Flow
     └─ AutopayForm → /api/autopay/create-subscription → Razorpay Subscription
        └── Webhook Listener (/api/autopay/webhook)
            └─ Creates Donation records for each charge
```

---

**You're all set! 🎉 The feature is ready for production testing.**

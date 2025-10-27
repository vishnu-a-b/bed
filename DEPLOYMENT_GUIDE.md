# Production Deployment Guide

## Issue Fixed
- **Problem**: Payment callback returning 404 with duplicate `/payment/payment/verify` path
- **Root Cause**: `FRONTEND_URL` environment variable included `/payment` suffix
- **Solution**: Updated backend callback handlers and fixed environment configuration

---

## Backend Deployment Steps

### 1. Update Production `.env` File

SSH into your production server and update the `.env` file:

```bash
ssh your-production-server
cd /path/to/server
```

Copy the contents of `.env.production` or manually update these critical values:

```bash
# IMPORTANT: Remove /payment suffix from FRONTEND_URL
FRONTEND_URL=https://donate.shanthibhavan.in

# NOT this:
# FRONTEND_URL=https://donate.palliativeinternational.com/payment  ❌

# Production Razorpay Keys
RAZORPAY_KEY_ID=rzp_live_RGb8eb4GQxS75R
RAZORPAY_KEY_SECRET=1wrDJTnvTxej9TJ369LkJpqC

# Production PayPal Keys
PAYPAL_CLIENT_ID=AV6Ud_hYeBMlNboFIFdHSYUbN65aLDxj-nUbb-vEf5_rLpz8OiJi11-pQUB_Urbz11awRPsera8mVzSm
PAYPAL_CLIENT_SECRET=ENrJQeOdQc1cx05JKYtGXnV1vaf1RFAZMSCotRcRXwqul0IuCwCGHbmhDUinxjxUdK8bYyo1y1AtqyRF
PAYPAL_BASE_URL=https://api-m.paypal.com

NODE_ENV=production
```

### 2. Deploy Backend Code

```bash
# Pull latest code
git pull origin main  # or your production branch

# Install dependencies
npm install

# Build TypeScript (if needed)
npm run build

# Restart the server
pm2 restart all
# OR
sudo systemctl restart your-backend-service
```

### 3. Verify Backend Deployment

Check that the server is running:
```bash
pm2 status
# OR
sudo systemctl status your-backend-service

# Check logs
pm2 logs
# OR
sudo journalctl -u your-backend-service -f
```

Test the callback endpoint:
```bash
curl -X POST https://api.donatebed.shanthibhavan.in/v1/payment/callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "razorpay_payment_id=test_123" \
  -d "razorpay_order_id=test_order" \
  -d "razorpay_signature=test_sig" \
  -L

# Should redirect to: https://donate.shanthibhavan.in/payment/verify?...
```

---

## Frontend Deployment Steps

### 1. Verify `.env.local` (Already Correct)

```bash
NEXT_PUBLIC_API_URL=https://api.donatebed.shanthibhavan.in/v1
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AV6Ud_hYeBMlNboFIFdHSYUbN65aLDxj-nUbb-vEf5_rLpz8OiJi11-pQUB_Urbz11awRPsera8mVzSm
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RGb8eb4GQxS75R
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=1wrDJTnvTxej9TJ369LkJpqC
```

### 2. Build and Deploy Static Export

```bash
cd client

# Build the static export
npm run build

# Output will be in: client/out/

# Deploy the 'out' folder to your static hosting
# (Netlify, Vercel, S3, etc.)
```

### 3. Deploy to Static Host

**Option A: Netlify**
```bash
netlify deploy --prod --dir=out
```

**Option B: Vercel**
```bash
vercel --prod
```

**Option C: Manual Upload**
Upload the contents of `client/out/` to your web server at `donate.shanthibhavan.in`

---

## New Payment Callback Flow

```
┌─────────────┐
│   User      │
│  Submits    │
│  Payment    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Frontend: donate.shanthibhavan.in              │
│  Creates order via API                          │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Backend: api.donatebed.shanthibhavan.in/v1     │
│  POST /generous-payments-ind/create             │
│  Returns: orderId, key, amount                  │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Frontend: Razorpay Embedded Checkout           │
│  Submits form to api.razorpay.com               │
│  User enters payment details                    │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Razorpay: Payment Processing                   │
│  On success → POST to callback_url              │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Backend Callback (NEW!)                        │
│  POST /v1/generous-payments-ind/callback        │
│  Receives: payment_id, order_id, signature      │
│  302 Redirect →                                 │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Frontend: /payment/verify                      │
│  URL: /payment/verify?razorpay_payment_id=...   │
│  Calls: POST /v1/generous-payments-ind/verify   │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Backend: Verify Signature                      │
│  POST /v1/generous-payments-ind/verify          │
│  Returns: success + payment details             │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Frontend: Success/Cancel Page                  │
│  Show receipt or error message                  │
└─────────────────────────────────────────────────┘
```

---

## Callback Endpoints Created

| Payment Type | Callback URL | Handler Location |
|--------------|--------------|------------------|
| Generous Contributions (India) | `/v1/generous-payments-ind/callback` | `GenerousContributionPaymentIndController.ts:64` |
| Bed Payments (India - Supporters) | `/v1/payment/callback` | `Payment.ts:238` |
| Bed Payments (India) | `/v1/bed-payments-ind/callback` | `BedPaymentInd.ts:125` |

---

## Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] Environment variables loaded correctly
- [ ] Callback endpoints respond (use curl test above)
- [ ] Backend logs show "Razorpay callback received" messages

### Frontend Tests
- [ ] Static build completes successfully
- [ ] Forms load correctly
- [ ] Payment button triggers Razorpay checkout
- [ ] After payment, redirects to `/payment/verify` (not `/payment/payment/verify`)
- [ ] Payment verification works
- [ ] Success/cancel pages display correctly

### End-to-End Test
- [ ] Complete a real payment (₹1 test transaction)
- [ ] Verify callback reaches backend (check logs)
- [ ] Verify redirect works correctly
- [ ] Verify payment gets marked as successful in database
- [ ] Verify receipt/confirmation is shown

---

## Rollback Plan

If issues occur after deployment:

### Backend Rollback
```bash
# Restore previous .env
cp .env.backup .env

# Revert code
git checkout previous-commit-hash

# Restart
pm2 restart all
```

### Frontend Rollback
Redeploy previous build from your deployment service dashboard.

---

## Monitoring

### Backend Logs
```bash
# PM2
pm2 logs --lines 100

# Systemd
sudo journalctl -u your-service -f

# Look for:
# - "Razorpay callback received"
# - Payment verification messages
# - Any errors
```

### Frontend
- Check browser console for errors
- Check Network tab for failed API calls
- Monitor Razorpay dashboard for payment status

---

## Common Issues & Solutions

### Issue: Still getting 404 on callback
**Solution**: Verify `FRONTEND_URL` doesn't have `/payment` suffix in production `.env`

### Issue: Redirect goes to wrong domain
**Solution**: Check `FRONTEND_URL` is set to `https://donate.shanthibhavan.in`

### Issue: Payment verification fails
**Solution**: Verify `RAZORPAY_KEY_SECRET` matches the key used to create the order

### Issue: Signature verification fails
**Solution**: Ensure frontend and backend are using the same Razorpay key ID

---

## Support Contacts

- Razorpay Dashboard: https://dashboard.razorpay.com
- Razorpay Test Mode: Use for testing before production
- PayPal Dashboard: https://www.paypal.com/businessmanage

---

## Security Notes

⚠️ **Important**: Never commit `.env` files to Git!

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

Keep your keys secure:
- Razorpay Key Secret
- PayPal Client Secret
- MongoDB Password
- JWT Secrets

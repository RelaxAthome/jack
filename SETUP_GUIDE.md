# RelaxAtHome Admin System - Complete Setup Guide

## Quick Start for Your Admin Dashboard

This guide will help you set up your complete admin system with Supabase in just a few minutes.

### What You Have

✅ **Admin Dashboard Files:**
- `/admin-setup.html` - Create your first admin account
- `/admin-login.html` - Admin login page
- `/admin-dashboard.html` - Full admin dashboard
- `/admin-lib.js` - Admin functionality library
- `/admin-dashboard.js` - Dashboard interactions
- `/admin-forgot-password.html` - Password reset page
- `/supabase-setup.sql` - Complete database setup file

✅ **Your Public Website:**
- All existing pages remain unchanged
- All current features work as before
- No data has been deleted

---

## Step-by-Step Setup (5 Minutes)

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new organization
5. Create a new project
6. Wait for project to initialize (about 1-2 minutes)

### Step 2: Get Your Credentials (1 minute)

1. Open your Supabase project
2. Click **Settings** (bottom left gear icon)
3. Click **API** in the menu
4. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string)

### Step 3: Create Configuration File (30 seconds)

1. In your repo root directory, create a new file: `supabase-config.js`
2. Paste this content (replace with your actual values):

```javascript
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_ANON_KEY_HERE'
};
```

3. **Do NOT commit this file to GitHub** (it's in `.gitignore`)

### Step 4: Run Database Setup (1 minute)

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query** button
3. Copy the entire contents of `/supabase-setup.sql` from your repo
4. Paste it into the SQL editor
5. Click **Run** button
6. Wait for the query to complete (should see all green checkmarks)

**If you see any errors:**
- Check that you pasted the entire file correctly
- Scroll through the editor to see the error message
- Common issue: If you see "role does not exist" - ignore it, it's just a warning

### Step 5: Enable Email Authentication (30 seconds)

1. In Supabase, click **Authentication** (left sidebar)
2. Click **Providers**
3. Find **Email** - make sure it's toggled ON
4. Click **Save**

### Step 6: Create Your First Admin Account (1 minute)

1. Open `/admin-setup.html` in your browser
2. Enter your admin email address
3. Enter a strong password (must have:
   - At least 8 characters
   - Uppercase and lowercase letters
   - At least one number)
4. Confirm the password
5. Click **Create Admin Account**
6. Check your email for confirmation link
7. Click the confirmation link in the email

### Step 7: Verify Admin Account in Supabase

1. Go to Supabase → Authentication → Users
2. Find your admin email in the list
3. Check that email_confirmed_at shows a timestamp (not NULL)

If it shows NULL:
- Click the three dots next to your user
- Click "Confirm user email"

### Step 8: Log In to Admin Dashboard (30 seconds)

1. Open `/admin-login.html`
2. Enter your admin email and password
3. Click **Sign In**
4. You should be redirected to `/admin-dashboard.html`

---

## Your Admin Dashboard Features

Once logged in, you can:

### 📊 Dashboard
- View total appointments, inquiries, therapists, and services
- See upcoming appointments
- View pending inquiries

### 📅 Appointments
- Add new appointments
- Edit existing appointments
- Change appointment status (pending, confirmed, completed, cancelled)
- Assign therapists to appointments
- Filter by status
- Delete appointments

### 💬 Inquiries
- View all customer inquiries
- Mark inquiries as read/responded
- Filter by status (new, read, responded, closed)
- Respond to customer emails
- Delete inquiries

### 💆 Services
- Add new massage services
- Edit service details (name, description, duration, price)
- Delete services

### 👥 Therapists
- Add new therapists
- Edit therapist information (name, gender, specialization, phone)
- Set therapist status (active/inactive)
- Delete therapist records

### ⚙️ Settings
- Update business name
- Set business hours
- Manage service areas
- Configure max appointments per day

### 👤 My Account
- View your admin email
- Change your password
- Logout

---

## Important Security Notes

✅ **Your passwords are secure:**
- Stored encrypted in Supabase
- Never visible in source code
- Protected by RLS policies

✅ **Your data is protected:**
- Only authenticated admin users can access admin data
- Public website can only read active services
- All admin actions use secure Supabase Auth

✅ **Your GitHub repo is safe:**
- `supabase-config.js` is in `.gitignore`
- No credentials are committed
- Safe to make the repo public

---

## Troubleshooting

### "Supabase configuration not found"
- Make sure you created `supabase-config.js` in the repo root
- Check that you copied the correct URL and key
- Make sure the file is NOT in the .gitignore commit (it should just be ignored going forward)

### "Invalid login credentials"
- Make sure you confirmed your email in Supabase Auth
- Check that the email_confirmed_at field shows a timestamp
- Try password reset at `/admin-forgot-password.html`

### "Error accessing dashboard"
- Make sure you're logged in (session should be active)
- Check browser console for error messages (F12 → Console)
- Try clearing browser cache and logging in again

### Database queries not working
- Verify all RLS policies were created (run setup.sql again)
- Check Supabase SQL Editor → Logs for errors
- Make sure you're authenticated in auth.users table

---

## URLs for Your Admin System

| Page | URL | Purpose |
|------|-----|----------|
| Setup | `/admin-setup.html` | Create first admin account (run once) |
| Login | `/admin-login.html` | Admin login |
| Dashboard | `/admin-dashboard.html` | Admin control panel |
| Public Site | `/index.html` | Your public massage booking site |
| Forgot Password | `/admin-forgot-password.html` | Password reset |

---

## Next Steps

1. ✅ Complete all 8 setup steps above
2. ✅ Log in to your admin dashboard
3. ✅ Add your therapists
4. ✅ Confirm your services are showing
5. ✅ Test creating an appointment
6. ✅ Deploy your website to GitHub Pages or your preferred host

---

## Deployment Options

Your RelaxAtHome website can be deployed to:

1. **GitHub Pages (Free)** - Static files only
   - Go to Settings → Pages
   - Choose "Deploy from a branch"
   - Select main branch and / (root)

2. **Netlify (Free)** - Static files with more features
   - Connect your GitHub repo
   - Auto-deploys on every commit

3. **Vercel (Free)** - Similar to Netlify
   - Connect your GitHub repo
   - Full integration ready

4. **Your own server** - Full control
   - Upload files via FTP/SSH
   - Set up your own domain

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check browser console for errors (F12 → Console tab)
4. Verify all files are in the correct location

---

**Your RelaxAtHome admin system is now ready to use!** 🎉

Manage your massage business efficiently with a professional admin dashboard.

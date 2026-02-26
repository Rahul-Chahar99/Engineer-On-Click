# 🚀 LOCAL TESTING GUIDE

## Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd "c:\Users\HP\Desktop\backend deploy\Backend"
npm run dev
```
✅ Should see: "Server is running at port : 8000"

### 2. Start Frontend (Terminal 2)
```bash
cd "c:\Users\HP\Desktop\backend deploy\frontEnd"
npm run dev
```
✅ Should see: "Local: http://localhost:5173/"

### 3. Open Browser
Visit: http://localhost:5173

---

## 🔧 How It Works (NO CHANGES NEEDED FOR DEPLOYMENT!)

### Backend
- **Local**: `.env` has `NODE_ENV=development`
  - Cookies: `secure=false`, `sameSite=lax`
  - CORS: `*` (allows all origins)
  
- **Production (Render)**: Environment variable `NODE_ENV=production`
  - Cookies: `secure=true`, `sameSite=none`
  - CORS: Your Vercel URL

### Frontend
- **Local**: `.env.local` is empty
  - Uses Vite proxy: `/api/*` → `http://localhost:8000`
  
- **Production (Vercel)**: Environment variable `VITE_API_URL`
  - Direct calls to: `https://engineer-on-click-2.onrender.com`

---

## 📝 Files Changed (Marked with 🔧)

### Backend
1. `src/controllers/user.controller.js` - Cookie settings auto-adapt
2. `.env` - Added `NODE_ENV=development`

### Frontend
1. `.env.local` - Removed VITE_API_URL (uses proxy)

---

## ✅ Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can view profile
- [ ] Can update profile
- [ ] Cookies persist on refresh
- [ ] Admin dashboard works

---

## 🚀 Deploy to Production

Just push to GitHub - NO CHANGES NEEDED!

```bash
git add .
git commit -m "Your changes"
git push
```

**Render** will use `NODE_ENV=production` (set in dashboard)
**Vercel** will use `VITE_API_URL` (set in dashboard)

---

## 🐛 Troubleshooting

### Port already in use
```bash
npx kill-port 8000
npx kill-port 5173
```

### Cookies not working locally
- Check backend terminal: Should see `NODE_ENV=development`
- Check browser DevTools → Application → Cookies

### API calls failing
- Check frontend is calling `/api/*` (not full URL)
- Check backend terminal for errors
- Check `vite.config.js` proxy is configured

---

## 📌 Remember

- **Local**: Everything runs on localhost
- **Production**: Frontend (Vercel) + Backend (Render)
- **NO manual changes** needed when switching between local/production!

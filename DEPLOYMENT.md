# ☁️ PRODUCTION DEPLOYMENT CHECKLIST

## Render (Backend)

### Environment Variables to Add:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://rahulchahar020:rahul123@cluster0.p53naxw.mongodb.net
CORS_ORIGIN=https://engineer-on-click-6eln.vercel.app
BACKEND_URL=https://engineer-on-click-2.onrender.com
PORT=10000
ACCESS_TOKEN_SECRET=basically_here_we_use_a_complex_String_but_for_now_i_am_using_this_msg_as_a_string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=in_this_aslo_same_we_use_a_complex_string
REFRESH_TOKEN_EXPIRY=10D
CLOUDINARY_CLOUD_NAME=dcn8jsohi
CLOUDINARY_API_KEY=766554477756395
CLOUDINARY_API_SECRET=jTCzB06oB_dJztfwnMZ--wNXDxw
```

### Settings:
- Root Directory: `Backend`
- Build Command: `npm install`
- Start Command: `npm start`

---

## Vercel (Frontend)

### Environment Variables to Add:
```
VITE_API_URL=https://engineer-on-click-2.onrender.com
```

### Settings:
- Framework Preset: Vite
- Root Directory: `frontEnd`
- Build Command: `npm run build`
- Output Directory: `dist`

---

## ✅ Verification

After deployment:

1. Visit your Vercel URL
2. Try to login
3. Check cookies in DevTools
4. Refresh page - should stay logged in
5. Test all features

---

## 🔄 Update Process

1. Make changes locally
2. Test at http://localhost:5173
3. When ready:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
4. Render & Vercel auto-deploy
5. Wait 2-5 minutes
6. Test production site

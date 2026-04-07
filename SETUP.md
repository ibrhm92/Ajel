# دليل الإعداد والرفع - متجر الأجهزة

## 1. إعداد Firebase

روح console.firebase.google.com → Add project → فعّل Firestore و Storage
افتح src/config/firebase.js وحط بيانات مشروعك

## 2. أول أدمن - في Firestore Console أضف document في collection "users"

username: admin
passwordHash: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
كلمة المرور: admin123 - غيّرها بعد أول دخول
role: admin
isActive: true
failedAttempts: 0

## 3. رقم الواتساب

في CartPage.jsx و OrdersPage.jsx غيّر:
const WHATSAPP_NUMBER = "201000000000";

## 4. تشغيل محلي

npm install
npm run dev

## 5. رفع Vercel

npm install -g vercel
vercel --prod

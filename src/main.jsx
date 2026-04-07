// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initDefaultAdmin } from "./utils/initAdmin";

// إنشاء أول أدمن تلقائياً لو قاعدة البيانات فاضية
initDefaultAdmin();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

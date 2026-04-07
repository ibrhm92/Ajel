// src/components/BarcodeScanner.jsx
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result && scanning) {
        setScanning(false);
        onScan(result.getText());
      }
    }).catch(() => setError("مش قادر يوصل للكاميرا. تأكد من الصلاحيات"));

    return () => {
      try { reader.reset(); } catch {}
    };
  }, []);

  return (
    <div style={s.overlay}>
      <div style={s.box}>
        <div style={s.header}>
          <span style={s.title}>📷 مسح الباركود</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error ? (
          <div style={s.error}>{error}</div>
        ) : (
          <div style={s.videoWrap}>
            <video ref={videoRef} style={s.video} autoPlay playsInline muted />
            <div style={s.scanLine} />
            <div style={s.corner} />
          </div>
        )}

        <p style={s.hint}>وجّه الكاميرا على الباركود</p>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  box: { background: "#1a2535", borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: 380, border: "1px solid #2a3a4a" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #2a3a4a" },
  title: { color: "#e8dcc8", fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: 15 },
  closeBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 },
  videoWrap: { position: "relative", background: "#000", lineHeight: 0 },
  video: { width: "100%", maxHeight: 280, objectFit: "cover" },
  scanLine: {
    position: "absolute", top: "50%", left: "10%", right: "10%", height: 2,
    background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
    animation: "scan 1.5s ease-in-out infinite alternate",
  },
  corner: { position: "absolute", inset: "15%", border: "2px solid #c9a84c44", borderRadius: 8, pointerEvents: "none" },
  hint: { textAlign: "center", color: "#7a8a9a", fontSize: 13, fontFamily: "'Cairo',sans-serif", margin: "12px 0" },
  error: { color: "#ff8888", textAlign: "center", padding: 20, fontFamily: "'Cairo',sans-serif", fontSize: 14 },
};

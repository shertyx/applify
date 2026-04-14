"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      padding: "24px",
    }}>
      <div className="animate-in" style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "360px",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "linear-gradient(135deg, #58a6ff, #bc8cff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
          Autoplication
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "32px" }}>
          Ta plateforme de recherche d'emploi intelligente
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "10px 16px",
            background: "#fff", border: "1px solid #dadce0",
            borderRadius: "8px", cursor: "pointer",
            fontSize: "14px", fontWeight: 500, color: "#3c4043",
            transition: "box-shadow 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continuer avec Google
        </button>
      </div>
    </main>
  );
}

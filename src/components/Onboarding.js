"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    icon: "⚡",
    titre: "Bienvenue sur Applify",
    description: "Ta plateforme de recherche d'emploi intelligente. En 5 étapes, on te montre comment en tirer le maximum.",
    action: null,
  },
  {
    icon: "👤",
    titre: "Complete ton profil",
    description: "Ajoute ton nom, ton poste recherché et surtout ton CV. L'IA s'en sert pour calculer ta compatibilité avec chaque offre.",
    action: { label: "Aller au profil", href: "/profil" },
  },
  {
    icon: "🔍",
    titre: "Explore les offres",
    description: "Les offres sont scrapées automatiquement depuis France Travail, Google Jobs et JSearch. Clique sur \"Actualiser\" pour récupérer les dernières.",
    action: { label: "Voir les offres", href: "/offres" },
  },
  {
    icon: "🤖",
    titre: "Analyse ta compatibilité",
    description: "Sur chaque offre, clique sur \"Analyser\". L'IA compare la fiche de poste avec ton CV et te donne un score de match + les compétences clés.",
    action: { label: "Voir les offres", href: "/offres" },
  },
  {
    icon: "📋",
    titre: "Suis tes candidatures",
    description: "Postule ou mets en attente les offres qui t'intéressent. Retrouve-les dans le Dashboard avec leur score, leur statut et des filtres.",
    action: { label: "Voir le dashboard", href: "/dashboard" },
  },
  {
    icon: "✉️",
    titre: "Génère ta lettre de motivation",
    description: "Depuis n'importe quelle offre, clique sur \"Lettre\" pour qu'Applify rédige une lettre de motivation personnalisée à partir de ton profil.",
    action: { label: "Essayer", href: "/lettre" },
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [etape, setEtape] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem("applify_onboarding_done");
      if (!done) setVisible(true);
    } catch {}
  }, []);

  function fermer() {
    try { localStorage.setItem("applify_onboarding_done", "1"); } catch {}
    setVisible(false);
  }

  function suivant() {
    if (etape < STEPS.length - 1) {
      setEtape((e) => e + 1);
    } else {
      fermer();
    }
  }

  function aller(href) {
    fermer();
    router.push(href);
  }

  if (!visible) return null;

  const step = STEPS[etape];
  const derniere = etape === STEPS.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      backdropFilter: "blur(4px)",
    }}>
      <div className="animate-in" style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "36px 32px",
        width: "100%", maxWidth: "460px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        position: "relative",
      }}>
        {/* Fermer */}
        <button onClick={fermer} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none",
          color: "var(--text-muted)", cursor: "pointer",
          fontSize: "18px", lineHeight: 1, padding: "4px",
          borderRadius: "4px", transition: "color 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          ×
        </button>

        {/* Indicateur d'étapes */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setEtape(i)} style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: i <= etape ? "#58a6ff" : "var(--border)",
              cursor: "pointer", transition: "background 0.2s",
            }} />
          ))}
        </div>

        {/* Icône */}
        <div style={{
          fontSize: "40px", marginBottom: "16px",
          width: "64px", height: "64px",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {step.icon}
        </div>

        {/* Contenu */}
        <p style={{ fontSize: "11px", color: "#58a6ff", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Étape {etape + 1} / {STEPS.length}
        </p>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.3 }}>
          {step.titre}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "28px" }}>
          {step.description}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={suivant} style={{
            fontSize: "13px", padding: "8px 20px",
            background: "#238636", border: "1px solid #2ea043",
            borderRadius: "8px", color: "#fff", cursor: "pointer",
            fontWeight: 500, transition: "all 0.15s",
          }}>
            {derniere ? "Commencer" : "Suivant →"}
          </button>
          {step.action && (
            <button onClick={() => aller(step.action.href)} style={{
              fontSize: "13px", padding: "8px 20px",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {step.action.label}
            </button>
          )}
          {etape > 0 && (
            <button onClick={() => setEtape((e) => e - 1)} style={{
              fontSize: "13px", padding: "8px 14px",
              background: "transparent", border: "none",
              color: "var(--text-muted)", cursor: "pointer",
              marginLeft: "auto",
            }}>
              ← Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

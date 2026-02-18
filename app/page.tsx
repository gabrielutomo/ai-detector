"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type ResultData = {
  label: string;
  confidence: number;
  raw_score: number;
  is_ai: boolean;
};

type Status = "idle" | "dragging" | "loading" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPEG, PNG, WebP).");
      setStatus("error");
      return;
    }
    fileRef.current = file;
    setFileName(file.name);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setStatus("idle");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setStatus("dragging");
  };

  const handleDragLeave = () => {
    setStatus("idle");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!fileRef.current) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", fileRef.current);

      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Terjadi kesalahan pada server.");
      }

      const data: ResultData = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghubungi server.";
      setErrorMsg(message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg("");
    setFileName("");
    fileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050b18 0%, #0a1628 50%, #050b18 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🔍
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "18px",
                color: "#f0f6ff",
                letterSpacing: "-0.3px",
              }}
            >
              AI Detector
            </div>
            <div style={{ fontSize: "11px", color: "#475569" }}>
              Powered by CNN Deep Learning
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#475569",
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "20px",
            padding: "6px 14px",
          }}
        >
          v1.0.0
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px 80px",
          position: "relative",
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "13px",
              color: "#a78bfa",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            ✨ Deep Learning · CNN Architecture
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 3s linear infinite",
              }}
            >
              Deteksi Gambar AI
            </span>
            <br />
            <span style={{ color: "#f0f6ff" }}>vs Gambar Nyata</span>
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              maxWidth: "520px",
              lineHeight: 1.7,
            }}
          >
            Upload gambar dan biarkan model CNN kami menganalisis apakah gambar
            tersebut dibuat oleh AI atau merupakan foto nyata.
          </p>
        </div>

        {/* Upload + Result layout */}
        <div
          style={{
            width: "100%",
            maxWidth: "860px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Upload Zone */}
          <div
            id="upload-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !preview && fileInputRef.current?.click()}
            style={{
              width: "100%",
              minHeight: preview ? "auto" : "340px",
              background: "rgba(13,31,60,0.7)",
              backdropFilter: "blur(16px)",
              border: `2px dashed ${status === "dragging"
                ? "#7c3aed"
                : status === "error"
                  ? "#ef4444"
                  : "rgba(148,163,184,0.2)"
                }`,
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: preview ? "default" : "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                status === "dragging"
                  ? "0 0 40px rgba(124,58,237,0.3), inset 0 0 40px rgba(124,58,237,0.05)"
                  : "0 4px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Gradient overlay on drag */}
            {status === "dragging" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at center, rgba(124,58,237,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            )}

            {!preview ? (
              /* Empty state */
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  🖼️
                </div>
                <div>
                  <p
                    style={{
                      color: "#f0f6ff",
                      fontSize: "20px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    {status === "dragging"
                      ? "Lepaskan gambar di sini!"
                      : "Drag & Drop gambar di sini"}
                  </p>
                  <p style={{ color: "#475569", fontSize: "14px" }}>
                    atau{" "}
                    <span
                      style={{
                        color: "#a78bfa",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      klik untuk browse
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {["JPEG", "PNG", "WebP"].map((fmt) => (
                    <span
                      key={fmt}
                      style={{
                        background: "rgba(148,163,184,0.08)",
                        border: "1px solid rgba(148,163,184,0.12)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* Preview state */
              <div style={{ width: "100%", padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Image preview */}
                  <div style={{ flex: "0 0 auto" }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "220px",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "16px",
                        border: "1px solid rgba(148,163,184,0.15)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                    />
                  </div>

                  {/* File info + actions */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      justifyContent: "center",
                      paddingTop: "8px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        File dipilih
                      </p>
                      <p
                        style={{
                          color: "#f0f6ff",
                          fontSize: "16px",
                          fontWeight: 600,
                          wordBreak: "break-all",
                        }}
                      >
                        {fileName}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        id="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={status === "loading"}
                        className="btn-primary"
                        style={{ flex: 1, minWidth: "140px" }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          {status === "loading" ? (
                            <>
                              <span
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid rgba(255,255,255,0.3)",
                                  borderTopColor: "white",
                                  borderRadius: "50%",
                                  display: "inline-block",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                              Menganalisis...
                            </>
                          ) : (
                            <>🔬 Analisis Gambar</>
                          )}
                        </span>
                      </button>

                      <button
                        id="reset-btn"
                        onClick={handleReset}
                        style={{
                          background: "rgba(148,163,184,0.08)",
                          border: "1px solid rgba(148,163,184,0.15)",
                          borderRadius: "12px",
                          padding: "14px 20px",
                          color: "#94a3b8",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "rgba(148,163,184,0.15)";
                          (e.target as HTMLButtonElement).style.color = "#f0f6ff";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "rgba(148,163,184,0.08)";
                          (e.target as HTMLButtonElement).style.color = "#94a3b8";
                        }}
                      >
                        🔄 Ganti
                      </button>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#475569",
                        fontSize: "13px",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 0,
                      }}
                    >
                      + Pilih gambar lain
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
            id="file-input"
          />

          {/* Result Card */}
          {status === "done" && result && (
            <div
              id="result-card"
              style={{
                background: "rgba(13,31,60,0.8)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${result.is_ai
                  ? "rgba(239,68,68,0.3)"
                  : "rgba(16,185,129,0.3)"
                  }`,
                borderRadius: "24px",
                padding: "32px",
                animation: "fadeInUp 0.5s ease forwards",
                boxShadow: result.is_ai
                  ? "0 4px 40px rgba(239,68,68,0.1)"
                  : "0 4px 40px rgba(16,185,129,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: result.is_ai
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(16,185,129,0.12)",
                    border: `1px solid ${result.is_ai
                      ? "rgba(239,68,68,0.25)"
                      : "rgba(16,185,129,0.25)"
                      }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {result.is_ai ? "🤖" : "📷"}
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "4px",
                    }}
                  >
                    Hasil Deteksi
                  </p>
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: result.is_ai ? "#f87171" : "#34d399",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {result.label}
                  </h2>
                </div>

                {/* Badge */}
                <div
                  style={{
                    background: result.is_ai
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(16,185,129,0.15)",
                    border: `1px solid ${result.is_ai
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(16,185,129,0.3)"
                      }`,
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: result.is_ai ? "#f87171" : "#34d399",
                  }}
                >
                  {confidencePct}%
                </div>
              </div>

              {/* Confidence bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    Tingkat Keyakinan
                  </span>
                  <span
                    style={{
                      color: result.is_ai ? "#f87171" : "#34d399",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {confidencePct}%
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(148,163,184,0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="confidence-bar"
                    style={{
                      height: "100%",
                      width: `${confidencePct}%`,
                      background: result.is_ai
                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                        : "linear-gradient(90deg, #10b981, #34d399)",
                      borderRadius: "4px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {[
                  {
                    label: "Raw Score",
                    value: result.raw_score.toFixed(4),
                    hint: "> 0.5 = AI",
                  },
                  {
                    label: "Confidence",
                    value: `${confidencePct}%`,
                    hint: "Keyakinan model",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(148,163,184,0.05)",
                      border: "1px solid rgba(148,163,184,0.08)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  >
                    <p
                      style={{
                        color: "#475569",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        color: "#f0f6ff",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p style={{ color: "#334155", fontSize: "11px" }}>
                      {stat.hint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Card */}
          {status === "error" && (
            <div
              id="error-card"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "16px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                animation: "fadeInUp 0.4s ease forwards",
              }}
            >
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <div>
                <p
                  style={{
                    color: "#f87171",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  Terjadi Kesalahan
                </p>
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* How it works */}
          {!preview && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "8px",
              }}
            >
              {[
                {
                  icon: "📤",
                  title: "1. Upload",
                  desc: "Drag & drop atau pilih gambar dari perangkat kamu",
                },
                {
                  icon: "🧠",
                  title: "2. Analisis CNN",
                  desc: "Model CNN menganalisis pola piksel dan artefak AI",
                },
                {
                  icon: "📊",
                  title: "3. Hasil",
                  desc: "Dapatkan hasil deteksi beserta tingkat keyakinan model",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  style={{
                    background: "rgba(13,31,60,0.5)",
                    border: "1px solid rgba(148,163,184,0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                    {step.icon}
                  </div>
                  <p
                    style={{
                      color: "#f0f6ff",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    {step.title}
                  </p>
                  <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "24px 32px",
          borderTop: "1px solid rgba(148,163,184,0.06)",
        }}
      >
        <p style={{ color: "#334155", fontSize: "13px" }}>
          © 2025{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 600,
            }}
          >
            Gabriel Adetya Utomo
          </span>
          . All rights reserved. · AI Image Detector powered by CNN Deep Learning.
        </p>
      </footer>

      {/* Inline keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

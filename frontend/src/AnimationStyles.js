// AnimationStyles.js
// Centralized animation keyframes and reusable animation helpers for AgriNext UI

// This file injects global CSS keyframes and animation classes for use across the app.
// Import and call injectAnimationStyles() once in your App.js or main entry.

export function injectAnimationStyles() {
  if (typeof window !== 'undefined' && !window.__agrinext_all_anim) {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes cardEntrance {
        0% { opacity: 0; transform: translateY(60px) scale(0.9) rotate(-3deg); }
        60% { opacity: 1; transform: translateY(-8px) scale(1.05) rotate(2deg); }
        100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
      }
      @keyframes cardStagger {
        0% { opacity: 0; transform: translateY(40px) scale(0.95); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes buttonPop {
        0% { transform: scale(0.8); opacity: 0; }
        60% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes iconSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes iconBounce {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 #43a04744; }
        70% { box-shadow: 0 0 0 10px #43a04700; }
        100% { box-shadow: 0 0 0 0 #43a04700; }
      }
      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      @keyframes bgMove {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(30deg); }
      }
      @keyframes float1 {
        0% { transform: translateY(0); }
        50% { transform: translateY(-18px); }
        100% { transform: translateY(0); }
      }
      @keyframes float2 {
        0% { transform: translateY(0); }
        50% { transform: translateY(16px); }
        100% { transform: translateY(0); }
      }
      @keyframes float3 {
        0% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
        100% { transform: translateY(0); }
      }
      @keyframes notifSlide {
        0% { opacity:0; transform:translateY(-40px) scale(0.95); }
        60% { opacity:1; transform:translateY(0) scale(1.03); }
        100% { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes typingDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
      @keyframes weatherPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .anim-spin { animation: iconSpin 1.2s linear infinite; }
      .anim-bounce { animation: iconBounce 0.7s cubic-bezier(.5,1.5,.5,1) infinite; }
      .anim-pulse { animation: pulse 1.2s infinite; }
      .anim-shimmer {
        background: linear-gradient(90deg, #e0ffe0 25%, #fff 50%, #e0ffe0 75%);
        background-size: 400px 100%;
        animation: shimmer 1.5s linear infinite;
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateX(-10px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes liveBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .live-badge {
        animation: liveBlink 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    window.__agrinext_all_anim = true;
  }
}

import React from 'react'
import TypingAnimation from './TypingAnimation'

const styleMap = {
  journey: { bg: '#eaffd8', rotate: -4 },
  skills: { bg: '#eaffd8', rotate: 3 },
  mementos: { bg: '#eaffd8', rotate: -2 },
  default: { bg: '#fff7b5', rotate: 0 }
}

const HotspotPopup = ({ hotspot, onClose }) => {
  if (!hotspot) return null;
  const cfg = styleMap[hotspot.id] || styleMap.default;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      zIndex: 50,
    }} onClick={onClose}>
      <div style={{
        width: 'clamp(220px, 70%, 360px)',
        maxWidth: '90%',
        transform: `rotate(${cfg.rotate}deg)`,
        background: cfg.bg,
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
        position: 'relative',
        border: '1px solid rgba(0,0,0,0.06)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* little sticky tape */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%) rotate(-2deg)',
          top: -12,
          width: 60,
          height: 14,
          background: '#f1e28a',
          borderRadius: 3,
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.06)'
        }} />

        <button onClick={onClose} style={{position: 'absolute', right: 8, top: 8, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer'}}>✕</button>

        <h3 className="hotspot-popup-title" style={{margin: '6px 0', fontSize: 'clamp(14px, 2.5vw, 18px)', fontWeight: 700}}>{hotspot.title}</h3>
        <TypingAnimation className="hotspot-popup__text" speed={28}>{hotspot.content}</TypingAnimation>

      </div>
    </div>
  )
}

export default HotspotPopup;

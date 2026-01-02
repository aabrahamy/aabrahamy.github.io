import React from 'react'

const HotspotPopup = ({ hotspot, onClose }) => {
  if (!hotspot) return null;

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
      background: 'rgba(0,0,0,0.35)',
      zIndex: 50,
    }}>
      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        maxWidth: 420,
        width: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{margin: 0}}>{hotspot.title}</h3>
          <button onClick={onClose} style={{border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer'}}>✕</button>
        </div>
        <p style={{marginTop: 12}}>{hotspot.content}</p>
      </div>
    </div>
  )
}

export default HotspotPopup;

import React from 'react'
import AudioOn from '../assets/AudioOn.png'
import AudioOff from '../assets/AudioOff.png'

const AudioLabel = ({ isPlaying, toggleAudio, trackName = 'wave to earth - pink horizon + pink' }) => {
  return (
    <div
      className="audio-label"
      onClick={toggleAudio}
      role="button"
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        zIndex: 60,
        padding: '4px 8px'
      }}
    >
      <img
        src={isPlaying ? AudioOn : AudioOff}
        alt={isPlaying ? 'Audio playing' : 'Audio off'}
        style={{ width: 24, height: 24, display: 'block' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="audio-label__text" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackName}</span>
      </div>
    </div>
  )
}

export default AudioLabel

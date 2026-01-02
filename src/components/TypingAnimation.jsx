import React, { useEffect, useState, useRef } from 'react'


const TypingAnimation = ({ children = '', speed = 30, className = '', sound = true, volume = 0.02 }) => {
  const text = typeof children === 'string' ? children : String(children)
  const [displayed, setDisplayed] = useState('')
  const [showCaret, setShowCaret] = useState(true)
  const audioRef = useRef(null)


  useEffect(() => {
    if (!sound) return
    if (!audioRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext
        const ctx = new Ctx()
        const master = ctx.createGain()
        master.gain.value = volume
        master.connect(ctx.destination)
        audioRef.current = { ctx, master }
      } catch (err) {
        audioRef.current = null
      }
    }

    return () => {}
  }, [sound, volume])

  useEffect(() => {
    let i = 0
    setDisplayed('')
    let intervalId = null

    const playClick = async (ch) => {
      if (!sound || !audioRef.current) return
      if (/\s/.test(ch)) return

      const { ctx, master } = audioRef.current
      try {
        if (ctx.state === 'suspended') await ctx.resume()
      } catch (err) {
        // ignore
      }

      const now = ctx.currentTime

      
      const length = Math.floor(ctx.sampleRate * 0.03) // ~30ms
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
       
        data[i] = (Math.random() * 2 - 1) * (1 - i / length)
      }

      const src = ctx.createBufferSource()
      src.buffer = buffer

      
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.setValueAtTime(2000 + Math.random() * 2500, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(1.0, now + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      src.connect(hp)
      hp.connect(gain)
      gain.connect(master)
      src.start(now)
      src.stop(now + 0.06)

    
      setTimeout(() => {
        try { src.disconnect(); hp.disconnect(); gain.disconnect(); } catch (e) {}
      }, 200)
    }

    intervalId = setInterval(() => {
      const ch = text[i] ?? ''
      setDisplayed((prev) => prev + ch)

     
      playClick(ch)

      i += 1
      if (i >= text.length) {
        clearInterval(intervalId)
      }
    }, speed)

    const caret = setInterval(() => setShowCaret((s) => !s), 500)

    return () => {
      clearInterval(intervalId)
      clearInterval(caret)
    }
  }, [text, speed, sound])

  
  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.ctx && typeof audioRef.current.ctx.close === 'function') {
        audioRef.current.ctx.close().catch(() => {})
      }
    }
  }, [])

  return (
    <p className={className} style={{ marginTop: 8, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
      {displayed}
      <span style={{ opacity: showCaret ? 1 : 0, marginLeft: 4 }}>{'|'}</span>
    </p>
  )
}

export default TypingAnimation

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useEffect, useRef, useState } from 'react'

import Navbar from './components/Navbar';
import { About, Contact, Home, Projects } from "./pages";
import bgAudioFile from './assets/w2e.mp3'
import AudioLabel from './components/AudioLabel'

const App = () => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // initialize audio element
    const audio = new Audio(bgAudioFile)
    audio.loop = true
    audio.volume = 0.06
    audioRef.current = audio

    // Try to autoplay (may be blocked); if blocked, wait for first user gesture
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      const tryPlay = () => {
        audio.play().then(() => setIsPlaying(true)).catch(() => {})
        document.removeEventListener('pointerdown', tryPlay)
      }
      document.addEventListener('pointerdown', tryPlay)
    })

    return () => {
      try { audio.pause(); audio.src = ''; } catch (e) {}
    }
  }, [])

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <main className='bg-slate-300/20'>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/contact' element={<Contact />} />
     </Routes>
    </Router>

    <AudioLabel isPlaying={isPlaying} toggleAudio={toggleAudio} />
   </main>
  )
}

export default App
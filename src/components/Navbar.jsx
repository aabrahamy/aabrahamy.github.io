import { NavLink } from 'react-router-dom'

const Navbar = ({ isPlaying, toggleAudio }) => {
    return (
        <header className="header">
            <div className="fixed left-4 top-6 md:left-44 lg:left-52 xl:left-60 md:top-1/2 md:-translate-y-1/2 transform flex flex-col items-start gap-2 md:gap-3 text-sm md:text-lg"> 
              <NavLink to="/" end className={({ isActive }) => isActive ? 'text-[#7e843e] font-bold' : 'text-black font-normal'}>
                Home
              </NavLink>

              <NavLink to="/about" className={({ isActive }) => isActive ? 'text-[#7e843e] font-bold' : 'text-black font-normal'}>
                About
              </NavLink>

              <NavLink to="/projects" className={({ isActive }) => isActive ? 'text-[#7e843e] font-bold' : 'text-black font-normal'}>
                Projects
              </NavLink>


            </div>
        </header>
    )
}

export default Navbar
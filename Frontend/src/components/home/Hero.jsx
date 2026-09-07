import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
   
    const [menuOpen, setMenuOpen] = React.useState(false)

   
  return (
    <>
            <nav className='h-20'>
                <div className='fixed left-0 top-0 right-0 z-100 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white transition-all'>
                    <a href="">
                        <img src="/logo (1).svg" alt="logo" className="h-11 w-auto" />
                    </a>

                    {/* Desktop Menu */}
                    <div className='hidden sm:flex items-center gap-4 md:gap-8 max-md:text-sm text-gray-800'>
                        <a href="#" onClick={() => scrollTo(0, 0)}> Home </a>
                        <a href="#" onClick={() => scrollTo(0, 0)}> Features </a>
                        <a href="#" onClick={() => scrollTo(0, 0)}> About </a>
                        <a href="#" onClick={() => scrollTo(0, 0)}> Contact </a>
                    </div>

                    <div>
                        <Link to='/app?state=login' className='max-sm:hidden cursor-pointer px-8 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-full'>Login</Link>
                        <button onClick={() => setMenuOpen(true)} className="md:hidden active:scale-95 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>
                        </button> 
                    </div>

                </div>
                {/* Mobile Menu */}
                <div className={`sm:hidden fixed inset-0 ${menuOpen ? 'w-full' : 'w-0'} overflow-hidden bg-white backdrop-blur shadow-xl rounded-lg z-200 text-sm transition-all`}>
                    <div className='flex flex-col items-center justify-center h-full text-xl font-semibold gap-6 p-4'>
                        <a href='#' onClick={() => scrollTo(0, 0)}> Home </a>
                        <a href='#' onClick={() => scrollTo(0, 0)}> Features </a>
                        <a href='#' onClick={() => scrollTo(0, 0)}> About </a>
                        <a href='#' onClick={() => scrollTo(0, 0)}> Contact </a>
                        <Link to='/app?state=login' className='cursor-pointer px-8 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-full'>Login</Link>
                        <button onClick={() => setMenuOpen(false)} className="md:hidden active:scale-95 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute size-8 right-6 top-6 text-gray-500 hover:text-gray-700 cursor-pointer"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="rethink relative flex flex-col items-center justify-center text-sm px-4 md:px-16 lg:px-24 xl:px-40 text-gray-800">

                {/* Avatars + Stars */}
               {/* <div className="flex items-center mt-24 md:mt-36">
                    <div className="flex -space-x-3 pr-3">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-1" />
                        <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="user1" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-2" />
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="user2" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-3" />
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-4" />
                        <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="user5" className="size-8 rounded-full border-2 border-white hover:-translate-y-0.5 transition z-5" />
                    </div>

                    <div>
                        <div className="flex ">
                            {Array(5).fill(0).map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-transparent fill-blue-600" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                            ))}
                        </div>
                        <p className="text-sm text-gray-700"> Used by 10,000+ users </p>
                    </div>
                </div>*/}

                {/* Headline */}
                                <h1 className="text-4xl md:text-6xl font-semibold max-w-lg md:max-w-2xl text-center mt-4 leading-tight md:leading-tight">
                                    Land your dream job with  <span className="relative bg-linear-to-r from-purple-700 to-[#764de1] bg-clip-text text-transparent">
                    
                        <div className="z-10 absolute bottom-0 left-0 w-full scale-120" >
                            <img src='https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gradient_arc.svg' alt="gradient" />
                        </div>
                    </span> <span className='relative bg-linear-to-r from-[#764de1] to-blue-600 bg-clip-text text-transparent'>AI-Powered</span> resumes.
                </h1>

                <p className="max-w-xl text-center text-base my-7">Create, edit and download resumes with AI-powered assistance.</p>

                {/* GetStarted*/}
                
                        <Link to='/app' className='bg-blue-600 text-white p-3 px-6 rounded-md cursor-pointer'> GetStarted </Link>
                    
            </div>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?&family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap');

                   .rethink {
                       font-family: 'Rethink Sans', sans-serif;
                   }
                `}
            </style>
        </>
  )
}

export default Hero

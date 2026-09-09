import React from 'react'
import { User2Icon, Mail, Lock } from "lucide-react";
const Login = () => {

  const query=new URLSearchParams(window.location.search)
  const urlState=query.get("state")
  const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()

    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-200">
      <form
            onSubmit={handleSubmit}
            className="sm:w-87.5 w-full text-center bg-blue-900 border border-gray-800 rounded-2xl px-8">
            <h1 className="text-white text-3xl mt-10 font-medium">
                {state === "login" ? "Login" : "Sign up"}
            </h1>

            <p className="text-gray-400 text-sm mt-2">Please {state} to continue</p>

            {state !== "login" && (
                <div className="flex items-center mt-6 w-full bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                    <User2Icon size={16} color="#6B7280" />
                    <input type="text" name="name" placeholder="Name" className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none " value={formData.name} onChange={handleChange} required />
                </div>
            )}

            <div className="flex items-center w-full mt-4 bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
              <Mail size={13} color="#6B7280"/>
              <input type="email" name="email" placeholder="Email id" className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none " value={formData.email} onChange={handleChange} required />
            </div>

            <div className=" flex items-center mt-4 w-full bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                <Lock size={13} color="#6B7280" />
                <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="mt-4 text-left">
                <button className="text-sm text-blue-400 hover:underline">
                    Forget password?
                </button>
            </div>

            <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-blue-600 hover:bg-blue-500 transition " >
                {state === "login" ? "Login" : "Sign up"}
            </button>

            <p onClick={() => setState(prev => prev === "login" ? "register" : "login") } className="text-gray-400 text-sm mt-3 mb-11 cursor-pointer" >
                {state === "login" ? "Don't have an account?" : "Already have an account?"}
                <span className="text-blue-400 hover:underline ml-1">click here</span>
            </p>
        </form>
    </div>
  )
}

export default Login

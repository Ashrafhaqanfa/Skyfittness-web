import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Dumbbell, Lock, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { isLoggedIn, authReady, isLoading, errorMessage, setErrorMessage, signIn, signUp } = useAuth()
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showGoogleNotice, setShowGoogleNotice] = useState(false)

  if (authReady && isLoggedIn) return <Navigate to="/" replace />

  function switchMode(toSignUp) {
    setIsSignUpMode(toSignUp)
    setErrorMessage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSignUpMode) {
      await signUp(name, email, password)
    } else {
      await signIn(email, password)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner header */}
      <div className="relative h-52 bg-gradient-to-br from-gray-900 to-gray-600 flex items-end overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white/10 select-none"><Dumbbell size={90} strokeWidth={1.5} /></div>
        <div className="relative z-10 flex items-center gap-3 p-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow"><Dumbbell size={26} className="text-accent" /></div>
          <div>
            <h1 className="text-white text-xl font-bold">Gym Admin Portal</h1>
            <p className="text-white/80 text-xs mt-1">
              Manage members, collection, expenses, plans & reports and much more.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Existing/New toggle */}
        <div className="bg-gray-200 rounded-full p-1 flex mb-4">
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              !isSignUpMode ? 'bg-accent-light text-accent' : 'text-gray-500'
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><Lock size={14} /> EXISTING</span>
          </button>
          <button
            onClick={() => switchMode(true)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              isSignUpMode ? 'bg-accent-light text-accent' : 'text-gray-500'
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><UserPlus size={14} /> NEW</span>
          </button>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold">{isSignUpMode ? 'Create Admin account' : 'Sign in'}</h2>
            <p className="text-sm text-gray-500">
              {isSignUpMode ? 'Register admin/owner account.' : 'Use admin credentials to continue.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3 py-2 rounded-full">
            <ShieldCheck size={14} /> Manage members, payments, attendance and more
          </div>

          {isSignUpMode && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          )}

          <input
            type="text"
            placeholder={isSignUpMode ? 'Email' : 'Email / Mobile No.'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-accent text-sm"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isSignUpMode && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember Me
            </label>
          )}

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-white font-semibold py-3 rounded-xl disabled:opacity-60"
          >
            {isLoading ? 'Please wait…' : isSignUpMode ? 'Register' : 'Sign In'}
          </button>

          {!isSignUpMode && (
            <>
              <button type="button" className="w-full text-center text-accent text-sm">
                Forgot Password?
              </button>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200" />
                OR
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleNotice(true)}
                className="w-full bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <span>G+</span> Continue with Google
              </button>
              {showGoogleNotice && (
                <p className="text-xs text-gray-500 text-center">
                  Google sign-in needs a one-time setup (Firebase Console → Authentication → Sign-in method →
                  enable Google) before it can work.
                </p>
              )}
            </>
          )}

          <p className="text-center text-sm text-gray-500">
            {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => switchMode(!isSignUpMode)} className="text-accent font-semibold">
              {isSignUpMode ? 'Login Now' : 'Register Now'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

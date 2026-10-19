import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // already logged in? skip the login page
  // (keep this AFTER all the useState lines)
  if (user) return <Navigate to={homeFor(user.role)} replace />

  const handleSignIn = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setErrorMessage('Please fill in both work email and password.')
      return
    }

    setLoading(true)
    try {
      const loggedIn = await login(email.trim().toLowerCase(), password)
      setErrorMessage('')
      navigate(homeFor(loggedIn.role))
    } catch (err) {
      setErrorMessage(err.message || 'Wrong email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Redirecting to password recovery...');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    alert('Redirecting to account creation...');
  };

  const handleGoogleLogin = () => {
    alert('Google authentication integration ready.');
  };

  return (
    <div className="h-screen h-dvh w-full bg-[#F7EDDF] text-[#48151C] flex flex-col justify-between p-4 sm:p-6 lg:px-[52px] lg:py-6 select-none overflow-hidden font-sans">

      <header className="w-full flex items-center justify-between shrink-0">
        <img src="/Logo1.svg" alt="logo" className='h-20 w-auto object-contain'/>
      </header>
      <main className="w-full max-w-[1520px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center flex-1 min-h-0 py-2">

        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center text-left space-y-6 lg:pr-8">
          <div className="space-y-1">
            <h2 className="font-serif font-normal lg:text-[clamp(44px,9vh,72px)] text-[#511820] leading-[1.05] tracking-tight">
              Simple, human,
            </h2>
            <h2 className="font-serif font-normal lg:text-[clamp(44px,9vh,72px)] text-[#511820] leading-[1.05] tracking-tight">
              and unified.
            </h2>
          </div>
          <p className="font-sans text-[22px] lg:text-[clamp(18px,3vh,25px)] text-[#331116] font-normal leading-[1.4] max-w-[640px]">
            Access your workplace dashboard to manage, approve, and empower your workforce.
          </p>
        </div>
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full h-full min-h-0">
          <div className="w-full max-w-[525px] h-full max-h-[705px] bg-[#511820] rounded-[20px] shadow-2xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between text-[#F7EDDF] box-border">

            <div className="text-center space-y-1 mb-3">
              <h3 className="font-serif text-[clamp(26px,4.5vh,44px)] font-normal text-white tracking-wide">
                Welcome Back
              </h3>
              <p className="font-sans text-[clamp(13px,2vh,20px)] text-[#D9A1A0] font-light">
                Sign in to your account to continue.
              </p>
            </div>
            {errorMessage && (
              <div className="mb-2 p-2 bg-red-900/40 border border-red-400 text-red-200 text-sm rounded-lg text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-[clamp(8px,1.8vh,20px)] flex-1 flex flex-col justify-center">

              <div className="space-y-1">
                <label className="block text-sm sm:text-base font-light text-[#F7EDDF]" htmlFor="work-email">
                  Work Email
                </label>
                <input
                  id="work-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work Email"
                  className="w-full h-[clamp(40px,6.5vh,55px)] px-5 bg-transparent border border-[#D9A1A0] rounded-xl text-white placeholder-[#D9A1A0]/60 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0] text-base transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm sm:text-base font-light text-[#F7EDDF]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-[clamp(40px,6.5vh,55px)] px-5 pr-14 bg-transparent border border-[#D9A1A0] rounded-xl text-white placeholder-[#D9A1A0]/60 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0] text-base transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D9A1A0] hover:text-white transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer text-[#F7EDDF]/90 hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D9A1A0] text-[#511820] focus:ring-[#D9A1A0] bg-transparent cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#D9A1A0] hover:text-white underline-offset-4 hover:underline transition-colors font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[clamp(40px,6.5vh,55px)] bg-[#D9A1A0] text-[#511820] font-semibold text-lg rounded-xl hover:bg-[#cca2a1] active:scale-[0.99] transition-all shadow-md flex items-center justify-center disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D9A1A0]/30"></div>
                </div>
                <div className="relative bg-[#511820] px-4 text-xs uppercase tracking-widest text-[#D9A1A0]">
                  or
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-[clamp(40px,6.5vh,55px)] bg-transparent border border-[#D9A1A0] text-white font-medium rounded-xl hover:bg-white/5 transition-all flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.31 7.23 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.25c-.25-.72-.39-1.5-.39-2.25s.14-1.53.39-2.25V6.6H1.2C.44 8.14 0 9.87 0 12s.44 3.86 1.2 5.4l4.08-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.69 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            <div className="text-center mt-3">
              <p className="text-sm font-light text-[#F7EDDF]">
                Don’t have an account?{' '}
                <Link
                  to="/create-account"
                  className="text-[#D9A1A0] font-medium hover:underline underline-offset-4"
                >
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}

export default Login;
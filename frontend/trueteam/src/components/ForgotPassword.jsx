import React, { useState } from 'react'
import { Link } from 'react-router-dom'

async function requestPasswordReset(email) {
  return { ok: true }
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess('')

    if (!email.trim()) return setError('Please enter your work email.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')

    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSuccess("If an account exists for this email, you'll receive a password reset link.")
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#F7EDDF] px-4 py-6 font-sans">
      <div className="flex w-full max-w-[468px] flex-col justify-center rounded-xl bg-[#511820] p-6 shadow-xl sm:min-h-[532px] sm:px-[34px] sm:py-8">

        {/* Logo */}
        <p className="text-center font-serif text-[32px] text-[#F7EDDF] sm:text-[36px]">
          Empower <span className="text-[#D9A1A0]">HR</span>
        </p>

        {/* Lock icon */}
        <svg className="mx-auto mt-5 h-10 w-10 text-[#F7EDDF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V8a4 4 0 018 0v3" />
          <circle cx="12" cy="16" r="1" />
        </svg>

        <h1 className="mt-5 text-center text-[26px] font-medium text-white sm:text-[32px]">
          Forgot your password?
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-center text-base text-[#D9A1A0]">
          Enter your work email address below and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
          <label htmlFor="reset-email" className="mb-2 block text-sm text-[#F7EDDF]">
            Work Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="h-[51px] w-full rounded-[9px] border border-[#D9A1A0] bg-transparent px-[14px] text-[#F7EDDF] placeholder-[#F7EDDF]/70 transition focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
          />

          {error && <p role="alert" className="mt-2 text-sm text-red-200">{error}</p>}
          {success && <p role="status" className="mt-2 text-sm text-green-200">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-[51px] w-full rounded-[9px] bg-[#D9A1A0] text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" className="mt-5 text-center text-base text-[#D9A1A0] underline-offset-4 transition hover:underline">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword
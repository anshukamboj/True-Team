import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { register } = useAuth()

  // State definitions (Assumed matching your form usage)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    role: '',
    password: '',
    confirm: ''
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const roles = ['Admin', 'HR Manager', 'Employee', 'Recruiter']
  const inputClass = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-[#D9A1A0]/50 outline-none border border-transparent focus:border-[#D9A1A0] transition"

  // Dummy validation & change handlers (Assumed matching your form usage)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = (values, hasAgreed) => {
    const errorsFound = {}
    if (!values.fullName) errorsFound.fullName = 'Full Name is required'
    if (!values.email) errorsFound.email = 'Email is required'
    if (!values.role) errorsFound.role = 'Role selection is required'
    if (!values.password) errorsFound.password = 'Password is required'
    if (values.password !== values.confirm) errorsFound.confirm = 'Passwords do not match'
    if (!hasAgreed) errorsFound.terms = 'You must accept the terms'
    return errorsFound
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate(form, agreed)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      // Added await in case register makes an async network/API request
      const newUser = await register(form)          
      navigate(homeFor(newUser.role))
    } catch (err) {
      setFormError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  // One small helper so each field is a single line below
  const field = (name, placeholder, type = 'text') => (
    <div>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className={inputClass}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-200">{errors[name]}</p>}
    </div>
  )

  // Password field with a Show / Hide button
  const passwordField = (name, placeholder) => (
    <div>
      <div className="relative">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={placeholder}
          className={inputClass + ' pr-16'}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#D9A1A0] hover:text-white"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-200">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-[#F7EDDF] flex flex-col items-center justify-center px-4 py-4 overflow-x-hidden font-sans">
     <img src="/Logo1.svg" alt="logo" className='h-22 w-auto object-contain pb-6'/>

      <div className="w-full max-w-[650px] rounded-[20px] bg-[#511820] p-5 sm:p-[clamp(24px,4.5vh,42px)] text-[#F7EDDF]">
        <h2 className="text-center text-[clamp(24px,4.4vh,38px)] font-semibold text-white">
          Create your workspace
        </h2>
        <p className="mt-1 text-center text-[clamp(14px,2.2vh,20px)] text-[#D9A1A0]">
          Set up your HR platform in just a few steps.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-[clamp(14px,3vh,32px)]">
          <div className="grid grid-cols-1 gap-x-5 gap-y-[clamp(10px,1.8vh,18px)] sm:grid-cols-2">
            {field('fullName', 'Full Name')}
            {field('email', 'Work Email', 'email')}
            {field('phone', 'Phone Number', 'tel')}
            {field('company', 'Company Name')}
            {field('jobTitle', 'Job Title')}

            {/* Role dropdown */}
            <div>
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  aria-label="Role"
                  className={`${inputClass} appearance-none pr-10 ${form.role ? '' : 'text-[#D9A1A0]/70'}`}
                >
                  <option value="" disabled>Role</option>
                  {roles.map((r) => (
                    <option key={r} value={r} className="text-[#511820]">{r}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9A1A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-200">{errors.role}</p>}
            </div>

            {passwordField('password', 'Password')}
            {passwordField('confirm', 'Confirm Password')}
          </div>

          {/* Terms */}
          <h3 className="mt-[clamp(12px,2.5vh,26px)] text-base font-medium text-white">Terms &amp; Conditions</h3>
          <label className="mt-2 flex cursor-pointer items-center gap-3 text-[clamp(13px,2vh,18px)]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-5 w-5 shrink-0 cursor-pointer rounded accent-[#D9A1A0]"
            />
            <span>
              I agree to the{' '}
              <Link to="/about" className="text-[#D9A1A0] underline underline-offset-4 decoration-[#D9A1A0]/50 hover:text-white">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/about" className="text-[#D9A1A0] underline underline-offset-4 decoration-[#D9A1A0]/50 hover:text-white">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-200">{errors.terms}</p>}

          {formError && (
            <p role="alert" className="mt-3 rounded-lg border border-red-400 bg-red-900/40 p-2 text-center text-sm text-red-200">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-[clamp(12px,2.5vh,24px)] h-[clamp(46px,6.6vh,62px)] w-full rounded-xl bg-[#D9A1A0] text-lg font-semibold text-[#511820] transition hover:bg-[#e3b4b3] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-[clamp(10px,2vh,20px)] text-center text-[clamp(14px,2vh,18px)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#D9A1A0] hover:underline underline-offset-4">Sign in.</Link>
        </p>
      </div>
    </div>
  )
}
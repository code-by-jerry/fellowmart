'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight } from 'lucide-react'
import { SiteBrand } from '@/components/SiteBrand'
import { useSiteSettings } from '@/components/SiteSettingsProvider'

const supabase = createClient()
const OTP_LENGTH = 8

/** Set to true once Resend SMTP + domain are configured in Supabase. */
const ENABLE_EMAIL_LOGIN = false

function getAuthErrorMessage(error: { message?: string; status?: number }): string {
  const message = error.message?.trim()

  if (!message || message === '{}') {
    if (error.status === 500) {
      return 'Could not send the verification email. Check SMTP settings in Supabase (Authentication → Emails → SMTP Settings).'
    }
    return 'Something went wrong. Please try again.'
  }

  if (message.toLowerCase().includes('error sending')) {
    return 'Could not send the verification email. Verify your SMTP host, port, credentials, and sender address in Supabase.'
  }

  return message
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export function UserLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'entry' | 'otp'>('entry')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const settings = useSiteSettings()

  // Google OAuth
  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', next)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })
    
    if (error) {
      setError('Google login failed: ' + getAuthErrorMessage(error) + ' Please ensure Google provider is configured in Supabase.')
      setLoading(false)
    } else if (data.url) {
      window.location.href = data.url
    }
  }

  // Send OTP via Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    setLoading(false)

    if (error) {
      setError(getAuthErrorMessage(error))
      return
    }

    setStep('otp')
    setMessage(`A verification code has been sent to ${email}`)
  }

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    })

    setLoading(false)

    if (error) {
      setError(getAuthErrorMessage(error))
      return
    }

    router.replace(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-10 space-y-6">
          <div className="mb-4">
            <SiteBrand variant="login" />
          </div>
          {step === 'otp' && ENABLE_EMAIL_LOGIN ? (
            <>
              <div>
                <button
                  onClick={() => { setStep('entry'); setError(''); setMessage(''); }}
                  className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 mb-4 transition-colors"
                >
                  ← Back
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
                {message && (
                  <p className="text-sm text-green-600 mt-1">{message}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  We sent an {OTP_LENGTH}-digit verification code to <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={'• '.repeat(OTP_LENGTH).trim()}
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-gray-300"
                />
                <button
                  type="submit"
                  disabled={loading || otp.length < OTP_LENGTH}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Resend OTP
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to browse stores and place orders</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {ENABLE_EMAIL_LOGIN && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification Code'}
                      {!loading && <ArrowRight size={16} />}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>

        <div className="px-8 pb-6 text-center text-xs text-gray-400">
          Store owner?{' '}
          <Link href="/business/login" className="underline hover:text-primary transition-colors">
            Business sign in
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        &copy; {new Date().getFullYear()} {settings.app_name}. All rights reserved.
      </p>
    </div>
  )
}


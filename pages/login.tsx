import { useState } from 'react'
import { useRouter } from 'next/router'
import { css } from '@emotion/react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { redirect } = router.query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call the server-side API to validate password
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.valid) {
        // Set cookie
        document.cookie = `auth-token=${password}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days

        // Redirect to original destination or home
        const destination = typeof redirect === 'string' ? redirect : '/'
        router.push(destination)
      } else {
        setError('Invalid access code. Please check with your administrator.')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div css={css`
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `}>
      <div css={css`
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 48px;
        width: 90%;
        max-width: 420px;
      `}>
        {/* Logo/Icon */}
        <div css={css`
          text-align: center;
          margin-bottom: 32px;
        `}>
          <div css={css`
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
            border-radius: 20px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          `}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 css={css`
            font-size: 28px;
            font-weight: 700;
            color: #212327;
            margin: 0 0 8px 0;
          `}>
            Paid Media Suite
          </h1>
          <p css={css`
            font-size: 14px;
            color: #878F9E;
            margin: 0;
          `}>
            Growth Studio - Internal Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div css={css`
            margin-bottom: 24px;
          `}>
            <label css={css`
              display: block;
              font-size: 14px;
              font-weight: 600;
              color: #212327;
              margin-bottom: 8px;
            `}>
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your access code"
              required
              autoFocus
              css={css`
                width: 100%;
                padding: 14px 16px;
                border: 2px solid #DCE1EA;
                border-radius: 8px;
                font-size: 16px;
                font-family: 'Figtree', sans-serif;
                transition: all 0.2s;
                box-sizing: border-box;

                &:focus {
                  outline: none;
                  border-color: #6F2EFF;
                  background-color: #F9FBFF;
                }

                &::placeholder {
                  color: #AEAEAE;
                }
              `}
            />
          </div>

          {error && (
            <div css={css`
              padding: 12px 16px;
              background-color: #FEE;
              border: 1px solid #FCC;
              border-radius: 8px;
              margin-bottom: 24px;
            `}>
              <p css={css`
                margin: 0;
                font-size: 14px;
                color: #C00;
              `}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            css={css`
              width: 100%;
              padding: 14px 24px;
              background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              font-family: 'Figtree', sans-serif;
              cursor: ${isLoading ? 'not-allowed' : 'pointer'};
              transition: all 0.2s;
              opacity: ${isLoading ? '0.6' : '1'};

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(111, 46, 255, 0.3);
              }

              &:active:not(:disabled) {
                transform: translateY(0);
              }
            `}
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        {/* Footer Info */}
        <div css={css`
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #DCE1EA;
          text-align: center;
        `}>
          <p css={css`
            font-size: 13px;
            color: #878F9E;
            margin: 0;
          `}>
            🔒 This application is restricted to authorized personnel only.
            <br />
            Contact your administrator for access.
          </p>
        </div>
      </div>
    </div>
  )
}

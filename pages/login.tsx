import { useState } from 'react'
import { useRouter } from 'next/router'
import { css } from '@emotion/react'

const PASSWORD = 'TreasureData2024!' // Must match middleware

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { redirect } = router.query

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === PASSWORD) {
      // Set cookie that lasts 30 days
      document.cookie = `auth=${password}; path=/; max-age=${60 * 60 * 24 * 30}`

      // Redirect to original page or home
      const destination = typeof redirect === 'string' ? redirect : '/'
      router.push(destination)
    } else {
      setError('Incorrect password')
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
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 40px;
        width: 90%;
        max-width: 400px;
      `}>
        <h1 css={css`
          font-size: 24px;
          font-weight: 700;
          color: #212327;
          margin: 0 0 8px 0;
          text-align: center;
        `}>
          Paid Media Suite
        </h1>
        <p css={css`
          font-size: 14px;
          color: #878F9E;
          margin: 0 0 32px 0;
          text-align: center;
        `}>
          Enter password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            css={css`
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #DCE1EA;
              border-radius: 8px;
              font-size: 16px;
              font-family: 'Figtree', sans-serif;
              box-sizing: border-box;
              margin-bottom: ${error ? '12px' : '24px'};

              &:focus {
                outline: none;
                border-color: #6F2EFF;
              }
            `}
          />

          {error && (
            <p css={css`
              color: #ff0000;
              font-size: 14px;
              margin: 0 0 16px 0;
            `}>
              {error}
            </p>
          )}

          <button
            type="submit"
            css={css`
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;

              &:hover {
                transform: translateY(-2px);
              }
            `}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

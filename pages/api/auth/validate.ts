import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Get the valid token from server-side environment variable
    const validToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN || 'demo-access-2024'

    // Validate password
    if (password === validToken) {
      return res.status(200).json({ valid: true })
    } else {
      return res.status(200).json({ valid: false })
    }
  } catch (error) {
    console.error('Auth validation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

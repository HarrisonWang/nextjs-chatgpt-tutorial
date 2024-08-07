import { NextApiRequest, NextApiResponse } from 'next'

export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL

  const body = JSON.stringify({
    messages,
    model: 'openai/gpt-4o-2024-08-06',
    stream: false
  })

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Title': 'MOSS'
      },
      body
    })
    const data = await response.json()
    res.status(200).json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

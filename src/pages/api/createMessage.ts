import { NextApiRequest, NextApiResponse } from 'next'

export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  try {
    while (true) {
      const body = JSON.stringify({
        messages,
        model: 'openai/gpt-4o-2024-08-06',
        stream: false,
        tools: functions,
        tool_choice: 'auto'
      }, null, 2)
      console.log('Request body: \n', body)
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-Title': `${appName}`,
          'HTTP-Referer': `${appUrl}`
        },
        body
      })

      const data = await response.json()
      const { finish_reason, message } = data.choices[0]
      console.log('Response body: \n', JSON.stringify(data, null, 2))
      if (finish_reason === 'tool_calls') {
        const functionName = message.tool_calls[0].function.name
        const fucntionArguments = message.tool_calls[0].function.arguments
        const functionArgsArr = Object.values(fucntionArguments)
        const functionToCall = availableFunctions[functionName]
        const functionResponse = await functionToCall.apply(null, functionArgsArr)
        messages.push({
          role: 'function',
          name: functionName,
          content: `${JSON.stringify(functionResponse, null, 2)}`
        })
      } else if (finish_reason === 'stop') {
        res.status(200).json({ data })
        return
      }
    }
  } catch (error: any) {
    console.log('error: ', error)
    res.status(500).json({ error: error.message })
  }
}

async function getLocation() {
  return { latitude: 40.7128, longitude: -74.0060 }
}

async function getCurrentWeather(latitude: Number, longitude: Number) {
  return { temperature: 22, condition: "sunny" }
}

const functions = [
  {
    type: 'function',
    function: {
      name: 'getLocation',
      description: "Get the user's current location",
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getCurrentWeather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' }
        },
        required: ['latitude', 'longitude']
      }
    }
  }
]

const availableFunctions = {
  getCurrentWeather,
  getLocation
}

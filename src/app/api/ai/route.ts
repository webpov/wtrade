// pages/api/getCompletion.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type Data = {
  // Define the structure of your expected response here
  choices?: { text: string }[];
  error?: string;
};


const responseFormat = {
  "data": {
    "trend": "Overall downward trend with signs of recovery",
    "lvl": {
      "up": [64747.11, 64540.75],
      "down": [56886, 57499.99]
    },
    "vol": "Moderate to high",
    "reversals": {
      "upward": [60672, 61690.74],
      "downward": [60796.85, 59292.95]
    }
  },
  "msg": {
    "short": "Monitor for stabilization above 63000 before considering short-term buys.",
    "mid": "Potential for a recovery trend; keep an eye on resistance levels for breakout.",
    "long": "Maintain cautious approach due to high volatility and downward pressures."
  }
}


export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { prompt } = reqBody;

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // model: 'gpt-4',
        model: 'gpt-3.5-turbo-instruct',
        prompt: `${prompt} .note: respond in this JSON format: ${JSON.stringify(responseFormat)}`,
        max_tokens: 256,
      }),
    });

    const data = await response.json() as Data;
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error fetching data from OpenAI' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

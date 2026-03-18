import axios from "axios"

let lastCallTime = 0

const geminiResponse = async (command, assistantName, userName) => {
  
  const now = Date.now()
  if (now - lastCallTime < 3000) {
    console.log("🚫 Request blocked — too soon!")
    return null
  }
  lastCallTime = now

  try {
    const result = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `You are a virtual assistant named ${assistantName} created by ${userName}.

STRICT RULES:
- "type" field mein SIRF yeh values allowed hain, koi aur nahi:
  "general", "google-search", "youtube-search", "youtube-play", 
  "get-time", "get-date", "get-day", "get-month", 
  "calculator-open", "instagram-open", "facebook-open", "weather-show", "open-url"
- Koi naya type mat banana — sirf upar wali list se choose karo
- Only respond with the JSON object, no extra text, no markdown, no backticks.
- Respond in the SAME language the user spoke in — agar Hindi mein bola toh Hindi mein respond karo, English mein bola toh English mein
- Agar Hinglish mein bola toh Hinglish mein respond karo

Response format:
{
  "type": "sirf upar wali list mein se ek",
  "userInput": "<original user input without assistant name>",
  "response": "<short spoken response in same language as user>"
}

Type meanings:
- "general": factual question jiska answer tumhe pata ho — short answer do
- "google-search": Google pe kuch search karna ho
- "youtube-search": YouTube pe search karna ho
- "youtube-play": specific video/song play karna ho
- "calculator-open": calculator kholna
- "instagram-open": Instagram kholna
- "facebook-open": Facebook kholna
- "weather-show": weather dekhna
- "get-time": current time
- "get-date": aaj ki date
- "get-day": aaj ka din
- "get-month": current month
- "open-url": jab user koi bhi website ya app open karna chahta ho jaise Spotify, Netflix, Amazon, WhatsApp, Twitter etc.

Important:
- "open google" = "google-search" type
- "open youtube" = "youtube-search" type
- "open instagram" = "instagram-open" type
- "open facebook" = "facebook-open" type
- Baaki koi bhi app/website = "open-url" type
- Use ${userName} if asked who created you

User input: ${command}`
          }
        ],
        max_tokens: 200
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    let rawText = result.data.choices[0].message.content
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
    console.log("Groq Response:", rawText)
    return rawText

  } catch (error) {
    console.log("Groq Error:", error.response?.data || error.message)
    return null
  }
}

export default geminiResponse
interface FeedResponse {
  date: string
  time: string
  city: string
  weather: {
    temp: number
    description: string
    code: number
  } | null
  sun: {
    sunrise: string
    sunset: string
  } | null
  hackerNews: {
    title: string
    url: string
    by: string
  } | null
  wikipedia: {
    text: string
    year: number
  } | null
  quote: {
    text: string
    author: string
    lang: 'en' | 'fr'
  } | null
  exchangeRate: {
    base: string
    target: string
    rate: number
  } | null
  segments: Array<{
    text: string
    lang: 'en' | 'fr' | 'es' | 'de' | 'it' | 'jp' | 'cn' | 'ru' | 'pt'
    translations: { fr?: string, es?: string, de?: string, it?: string }
  }>
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  71: 'slight snowfall',
  73: 'moderate snowfall',
  75: 'heavy snowfall',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
}

async function getHackerNews(): Promise<FeedResponse['hackerNews']> {
  try {
    const topIdRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      headers: { 'User-Agent': 'francis-api/1.0' },
    })
    if (!topIdRes.ok) return null
    const topIds = (await topIdRes.json()) as number[]
    if (!Array.isArray(topIds) || topIds.length === 0) return null

    const id = topIds[0]!
    const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
      headers: { 'User-Agent': 'francis-api/1.0' },
    })
    if (!itemRes.ok) return null
    const item = (await itemRes.json()) as { title?: string, url?: string, by?: string } | null
    if (!item?.title) return null

    return {
      title: item.title,
      url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
      by: item.by ?? 'unknown',
    }
  } catch {
    return null
  }
}

async function getWikipedia(): Promise<FeedResponse['wikipedia']> {
  try {
    const now = new Date()
    const month = now.getUTCMonth() + 1
    const day = now.getUTCDate()
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
      { headers: { 'User-Agent': 'francis-api/1.0' } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { events?: Array<{ year: number, text: string }> }
    const events = data.events
    if (!events || events.length === 0) return null
    const event = events[Math.floor(Math.random() * events.length)]!
    return { text: event.text, year: event.year }
  } catch {
    return null
  }
}

async function getWeatherAndSun(): Promise<{
  city: string,
  weather: FeedResponse['weather'],
  sun: FeedResponse['sun']
}> {
  const fallbackCity = 'Paris'
  let lat = 48.8566
  let lon = 2.3522
  let city = fallbackCity

  try {
    const geoRes = await fetch('https://ipapi.co/json/')
    if (geoRes.ok) {
      const geo = (await geoRes.json()) as { latitude?: number, longitude?: number, city?: string }
      if (geo.latitude && geo.longitude) {
        lat = geo.latitude
        lon = geo.longitude
      }
      if (geo.city) city = geo.city
    }
  } catch {
    // keep fallback
  }

  let weather: FeedResponse['weather'] = null
  let sun: FeedResponse['sun'] = null

  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto`,
    )
    if (weatherRes.ok) {
      const wx = (await weatherRes.json()) as {
        current?: { temperature_2m?: number, weather_code?: number }
        daily?: { sunrise?: string[], sunset?: string[] }
      }
      const temp = wx.current?.temperature_2m ?? 0
      const code = wx.current?.weather_code ?? 0
      const description = WMO_DESCRIPTIONS[code] ?? 'unknown conditions'
      weather = { temp: Math.round(temp), description, code }

      if (wx.daily?.sunrise?.[0] && wx.daily?.sunset?.[0]) {
        const fmt = (iso: string) => iso.slice(11, 16)
        sun = {
          sunrise: fmt(wx.daily.sunrise[0]),
          sunset: fmt(wx.daily.sunset[0]),
        }
      }
    }
  } catch {
    // keep nulls
  }

  return { city, weather, sun }
}

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', lang: 'en' as const },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', lang: 'en' as const },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu', lang: 'en' as const },
  { text: 'Be the change you wish to see in the world.', author: 'Gandhi', lang: 'en' as const },
  { text: 'La simplicité est la sophistication finale.', author: 'Léonard de Vinci', lang: 'fr' as const },
  { text: 'La vie est un mystère qu\'il faut vivre, et non un problème à résoudre.', author: 'Gandhi', lang: 'fr' as const },
  { text: 'On ne voit bien qu\'avec le cœur. L\'essentiel est invisible pour les yeux.', author: 'Antoine de Saint-Exupéry', lang: 'fr' as const },
]

async function getQuote(): Promise<FeedResponse['quote']> {
  try {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    return quote ?? null
  } catch {
    return null
  }
}

async function getExchangeRate(): Promise<FeedResponse['exchangeRate']> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD')
    if (!res.ok) return null
    const data = (await res.json()) as { rates?: Record<string, number> }
    const rate = data.rates?.USD
    if (typeof rate !== 'number') return null
    return { base: 'EUR', target: 'USD', rate }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event): Promise<FeedResponse> => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  })

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const [weather, hackerNews, wikipedia, quote, exchangeRate] = await Promise.all([
    getWeatherAndSun(),
    getHackerNews(),
    getWikipedia(),
    getQuote(),
    getExchangeRate(),
  ])

  const segments: FeedResponse['segments'] = []

  if (weather.weather) {
    segments.push({
      text: `Currently ${weather.weather.temp}°C, ${weather.weather.description}.`,
      lang: 'en',
      translations: {},
    })
  }

  if (weather.sun) {
    segments.push({
      text: `Sunrise at ${weather.sun.sunrise}, sunset at ${weather.sun.sunset}.`,
      lang: 'en',
      translations: {},
    })
  }

  if (hackerNews) {
    segments.push({
      text: `Trending on Hacker News: "${hackerNews.title}".`,
      lang: 'en',
      translations: {},
    })
  }

  if (wikipedia) {
    segments.push({
      text: `On this day in ${wikipedia.year}, ${wikipedia.text}`,
      lang: 'en',
      translations: {},
    })
  }

  if (exchangeRate) {
    segments.push({
      text: `Today, 1 ${exchangeRate.base} equals ${exchangeRate.rate.toFixed(3)} ${exchangeRate.target}.`,
      lang: 'en',
      translations: {},
    })
  }

  if (quote) {
    if (quote.lang === 'en') {
      segments.push({
        text: `As they say: "${quote.text}" — ${quote.author}.`,
        lang: 'en',
        translations: {},
      })
    } else {
      segments.push({
        text: `Comme on dit : "${quote.text}" — ${quote.author}.`,
        lang: 'fr',
        translations: {},
      })
    }
  }

  const { getApiKeyAndModels } = await import('../utils/config')
  const { apiKey, model: primaryModel, fallbackModels } = await getApiKeyAndModels(event)
  if (segments.length > 0 && apiKey) {
    const { translateBatch } = await import('../utils/translate')
    const texts = segments.map(s => s.text)
    const translations = await translateBatch(texts, apiKey, primaryModel, fallbackModels)
    if (translations) {
      segments.forEach((seg, i) => {
        seg.translations = translations[i] || {}
      })
    }
  }

  return {
    date: dateStr,
    time: timeStr,
    city: weather.city,
    weather: weather.weather,
    sun: weather.sun,
    hackerNews,
    wikipedia,
    quote,
    exchangeRate,
    segments,
  }
})

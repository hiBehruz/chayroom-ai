type ExchangeRateRow = {
  Ccy?: string
  Rate?: string
}

type FetchLike = (input: string, init?: RequestInit) => Promise<{
  ok?: boolean
  json: () => Promise<unknown>
}>

export async function fetchUsdRate(fetchImpl: FetchLike = $fetch.raw as unknown as FetchLike) {
  try {
    const response = await fetchImpl('https://cbu.uz/en/arkhiv-kursov-valyut/json/')
    if (response.ok === false) return null

    const payload = await response.json()
    if (!Array.isArray(payload)) return null

    const usd = payload.find((item: ExchangeRateRow) => item?.Ccy === 'USD')
    if (!usd?.Rate) return null

    const rate = Number.parseFloat(usd.Rate)
    return Number.isFinite(rate) ? rate : null
  } catch {
    return null
  }
}

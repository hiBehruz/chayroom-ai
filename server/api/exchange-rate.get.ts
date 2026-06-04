export default defineEventHandler(async () => {
  const data = await $fetch<Array<{ Ccy: string, Rate: string }>>(
    'https://cbu.uz/en/arkhiv-kursov-valyut/json/'
  )
  const usd = data.find(item => item.Ccy === 'USD')
  return { rate: usd ? parseFloat(usd.Rate) : null }
})

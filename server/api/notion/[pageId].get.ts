import { Client } from '@notionhq/client'
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pageId = getRouterParam(event, 'pageId') as string

  if (!config.notionApiKey || pageId === 'demo') return DEMO_NOTION_BLOCKS

  const notion = new Client({ auth: config.notionApiKey })

  const { results } = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100
  })

  return results as BlockObjectResponse[]
})

import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  const getPageWithRetry = async (pageId: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await api.getPage(pageId)
      } catch (error: any) {
        if ((error?.status === 406 || error?.status === 400) && attempt < maxRetries) {
          console.warn(`Notion API ${error.status} 에러 발생, ${attempt}번째 재시도...`)
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // 지수 백오프
          continue
        }
        throw error
      }
    }
    throw new Error('최대 재시도 횟수를 초과했습니다.')
  }

  const response = await getPageWithRetry(id)
  id = idToUuid(id)
  const collection = Object.values(response.collection)[0]?.value
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block[id].value

  // Check Type
  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response)
    const getBlocksWithRetry = async (blockIds: string[], maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await api.getBlocks(blockIds)
        } catch (error: any) {
          if ((error?.status === 406 || error?.status === 400) && attempt < maxRetries) {
            console.warn(`Notion API getBlocks ${error.status} 에러 발생, ${attempt}번째 재시도...`)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
            continue
          }
          throw error
        }
      }
      throw new Error('최대 재시도 횟수를 초과했습니다.')
    }
    
    const wholeBlocks = await (await getBlocksWithRetry(pageIds)).recordMap.block

    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties =
        (await getPageProperties(id, wholeBlocks, schema)) || null
      if (!wholeBlocks[id]) continue

      // Add fullwidth, createdtime to properties
      properties.createdTime = new Date(
        wholeBlocks[id].value?.created_time
      ).toString()
      properties.fullWidth =
        (wholeBlocks[id].value?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}
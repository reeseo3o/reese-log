import { NotionAPI } from "notion-client"

export async function getPostBlocks(id: string) {
  const api = new NotionAPI()
  
  const getPageWithRetry = async (pageId: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await api.getPage(pageId)
      } catch (error: any) {
        if ((error?.status === 406 || error?.status === 400) && attempt < maxRetries) {
          console.warn(`Notion API ${error.status} 에러 발생, ${attempt}번째 재시도...`)
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
          continue
        }
        throw error
      }
    }
    throw new Error('최대 재시도 횟수를 초과했습니다.')
  }
  
  const pageBlock = await getPageWithRetry(id)
  return pageBlock
}

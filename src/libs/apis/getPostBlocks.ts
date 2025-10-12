import { Client } from "@notionhq/client"
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { BlockWithChildren } from "src/types/notion"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})


function hasChildren(block: BlockObjectResponse): boolean {
  return (block as any).has_children === true
}

async function getBlockChildren(blockId: string): Promise<BlockWithChildren[]> {
  const blocks: BlockWithChildren[] = []
  let hasMore = true
  let startCursor: string | undefined = undefined

  while (hasMore) {
    try {
      const response: any = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: startCursor,
        page_size: 100,
      })

      const blockObjects = response.results.filter(
        (block: any): block is BlockObjectResponse => "type" in block
      )

      for (const block of blockObjects) {
        const blockWithChildren: BlockWithChildren = { ...block }
        
        if (hasChildren(block)) {
          blockWithChildren.children = await getBlockChildren(block.id)
        }

        blocks.push(blockWithChildren)
      }

      hasMore = response.has_more
      startCursor = response.next_cursor || undefined
    } catch (error: any) {
      console.error(`[Notion API Error] 블록 가져오기 실패 - blockId: ${blockId}`, error.message)
      throw error
    }
  }

  return blocks
}

export async function getPostBlocks(pageId: string): Promise<BlockWithChildren[]> {
  try {
    console.log(`[Notion API] 블록 가져오기 시작 - pageId: ${pageId}`)
    
    const blocks = await getBlockChildren(pageId)
    
    console.log(`[Notion API] 블록 가져오기 완료 - ${blocks.length}개 블록`)
    
    return blocks
  } catch (error: any) {
    console.error("[Notion API Error] getPostBlocks 실패:", error.message)
    if (error.code === "unauthorized") {
      console.error("→ NOTION_API_KEY를 확인하세요.")
    } else if (error.code === "object_not_found") {
      console.error("→ 페이지 ID를 확인하고, Integration이 페이지에 접근할 수 있는지 확인하세요.")
    }
    throw error
  }
}

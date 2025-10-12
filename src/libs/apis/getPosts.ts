import { CONFIG } from "site.config"
import { Client } from "@notionhq/client"
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { TPost, TPosts } from "src/types"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

function getPropertyValue(property: any): any {
  if (!property) return null

  switch (property.type) {
    case "title":
      return property.title.map((t: any) => t.plain_text).join("")
    case "rich_text":
      return property.rich_text.map((t: any) => t.plain_text).join("")
    case "multi_select":
      return property.multi_select.map((s: any) => s.name)
    case "select":
      return property.select?.name || null
    case "date":
      return property.date
    case "files":
      if (property.files && property.files.length > 0) {
        const file = property.files[0]
        return file.type === "external" ? file.external.url : file.file.url
      }
      return null
    case "people":
      return property.people.map((person: any) => ({
        id: person.id,
        name: person.name || undefined,
        profile_photo: (person as any).avatar_url || undefined,
      }))
    default:
      return null
  }
}

function convertNotionPageToPost(page: PageObjectResponse): TPost {
  const properties = page.properties
  
  const title = getPropertyValue(properties.Name || properties.title) || ""
  const slug = getPropertyValue(properties.slug) || ""
  const date = getPropertyValue(properties.date) || { start_date: page.created_time }
  const status = getPropertyValue(properties.status) || ["Public"]
  const type = getPropertyValue(properties.type) || ["Post"]
  
  const tags = getPropertyValue(properties.tags)
  const category = getPropertyValue(properties.category)
  const summary = getPropertyValue(properties.summary)
  const author = getPropertyValue(properties.author)
  const thumbnail = getPropertyValue(properties.thumbnail)
  
  const post: TPost = {
    id: page.id,
    date: {
      start_date: date.start || date.start_date || page.created_time,
    },
    type: Array.isArray(type) ? type : [type],
    slug,
    title,
    status: Array.isArray(status) ? status : [status],
    createdTime: page.created_time,
    fullWidth: false, // 공식 API에서는 fullWidth 정보를 얻기 어려움
  }

  // 선택적 속성은 값이 있을 때만 추가
  if (tags) post.tags = tags
  if (category) post.category = category
  if (summary) post.summary = summary
  if (author) post.author = author
  if (thumbnail) post.thumbnail = thumbnail

  return post
}

/**
 * Notion 데이터베이스에서 모든 포스트 가져오기
 */
export const getPosts = async (): Promise<TPosts> => {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID || CONFIG.notionConfig.pageId

    if (!databaseId) {
      throw new Error("NOTION_DATABASE_ID가 설정되지 않았습니다.")
    }

    console.log(`[Notion API] 데이터베이스 쿼리 시작 - databaseId: ${databaseId}`)

    let allPages: PageObjectResponse[] = []
    let hasMore = true
    let startCursor: string | undefined = undefined

    while (hasMore) {
      const response: any = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100,
      })

      const pages = response.results.filter(
        (page: any): page is PageObjectResponse => "properties" in page
      )

      allPages = allPages.concat(pages)
      hasMore = response.has_more
      startCursor = response.next_cursor || undefined

      console.log(`[Notion API] ${pages.length}개 페이지 로드됨 (총 ${allPages.length}개)`)
    }

    const posts = allPages.map(convertNotionPageToPost)

    posts.sort((a, b) => {
      const dateA = new Date(a.date.start_date || a.createdTime)
      const dateB = new Date(b.date.start_date || b.createdTime)
      return dateB.getTime() - dateA.getTime()
    })

    console.log(`[Notion API] 총 ${posts.length}개 포스트 로드 완료`)

    return posts
  } catch (error: any) {
    console.error("[Notion API Error] getPosts 실패:", error.message)
    if (error.code === "unauthorized") {
      console.error("→ NOTION_API_KEY를 확인하세요.")
    } else if (error.code === "object_not_found") {
      console.error("→ NOTION_DATABASE_ID를 확인하고, Integration이 데이터베이스에 연결되었는지 확인하세요.")
    }
    throw error
  }
}

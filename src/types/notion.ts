import { 
  PageObjectResponse, 
  PartialPageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse 
} from "@notionhq/client/build/src/api-endpoints"

export type NotionBlock = BlockObjectResponse | PartialBlockObjectResponse

export type BlockWithChildren = NotionBlock & {
  children?: BlockWithChildren[]
}

export type NotionPage = PageObjectResponse | PartialPageObjectResponse

export type RichText = {
  type: string
  text?: {
    content: string
    link?: {
      url: string
    } | null
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string | null
}


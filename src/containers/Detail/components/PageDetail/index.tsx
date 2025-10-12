import { TPost } from "@/src/types"
import { BlockWithChildren } from "@/src/types/notion"
import React from "react"
import NotionRenderer from "@components/NotionRenderer"

type Props = {
  blocks: BlockWithChildren[]
  data: TPost
}

const PageDetail: React.FC<Props> = ({ blocks, data }) => {
  return (
    <div className="m-auto max-w-4xl">
      <NotionRenderer blocks={blocks} />
    </div>
  )
}

export default PageDetail

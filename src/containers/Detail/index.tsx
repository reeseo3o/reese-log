import { TPost } from "@/src/types"
import { BlockWithChildren } from "@/src/types/notion"
import useMermaidEffect from "./hooks/useMermaidEffect"
import PostDetail from "./components/PostDetail"
import PageDetail from "./components/PageDetail"

type Props = {
  blocks: BlockWithChildren[]
  data: TPost
}

const Detail: React.FC<Props> = ({ blocks, data }) => {
  useMermaidEffect()

  return (
    <div>
      {data.type[0] === "Page" && (
        <PageDetail data={data} blocks={blocks} />
      )}
      {data.type[0] !== "Page" && (
        <PostDetail data={data} blocks={blocks} />
      )}
    </div>
  )
}

export default Detail

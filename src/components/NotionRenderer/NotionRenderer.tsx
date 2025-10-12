import React from "react"
import { BlockWithChildren } from "src/types/notion"
import Block from "./Block"

interface NotionRendererProps {
  blocks: BlockWithChildren[]
}

const NotionRenderer: React.FC<NotionRendererProps> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        콘텐츠가 없습니다.
      </div>
    )
  }

  const groupedBlocks: (BlockWithChildren | BlockWithChildren[])[] = []
  let currentBulletedList: BlockWithChildren[] = []
  let currentNumberedList: BlockWithChildren[] = []

  blocks.forEach((block) => {
    const blockType = (block as any).type

    if (blockType === "bulleted_list_item") {
      currentBulletedList.push(block)
    } else {
      if (currentBulletedList.length > 0) {
        groupedBlocks.push([...currentBulletedList])
        currentBulletedList = []
      }
      
      if (blockType === "numbered_list_item") {
        currentNumberedList.push(block)
      } else {
        if (currentNumberedList.length > 0) {
          groupedBlocks.push([...currentNumberedList])
          currentNumberedList = []
        }
        groupedBlocks.push(block)
      }
    }
  })

  if (currentBulletedList.length > 0) {
    groupedBlocks.push(currentBulletedList)
  }
  if (currentNumberedList.length > 0) {
    groupedBlocks.push(currentNumberedList)
  }

  return (
    <div className="notion-renderer">
      {groupedBlocks.map((item, index) => {
        if (Array.isArray(item)) {
          const firstBlockType = (item[0] as any).type
          
          if (firstBlockType === "bulleted_list_item") {
            return (
              <ul key={`list-${index}`} className="notion-list list-disc my-4">
                {item.map((block) => (
                  <Block key={block.id} block={block} />
                ))}
              </ul>
            )
          } else if (firstBlockType === "numbered_list_item") {
            return (
              <ol key={`list-${index}`} className="notion-list-numbered list-decimal my-4">
                {item.map((block) => (
                  <Block key={block.id} block={block} />
                ))}
              </ol>
            )
          }
        }
        
        return <Block key={(item as BlockWithChildren).id} block={item as BlockWithChildren} />
      })}
    </div>
  )
}

export default NotionRenderer


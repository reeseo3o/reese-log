import React, { useState } from "react"
import { BlockWithChildren } from "src/types/notion"
import RichText from "./RichText"
import CodeBlock from "./CodeBlock"

interface BlockProps {
  block: BlockWithChildren
}

const Block: React.FC<BlockProps> = ({ block }) => {
  const [isToggleOpen, setIsToggleOpen] = useState(false)

  const { type, id } = block as any

  switch (type) {
    case "heading_1": {
      const heading = block as any
      return (
        <h1 id={id} className="notion-h1 text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
          <RichText richTexts={heading.heading_1.rich_text} />
        </h1>
      )
    }

    case "heading_2": {
      const heading = block as any
      return (
        <h2 id={id} className="notion-h2 text-3xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
          <RichText richTexts={heading.heading_2.rich_text} />
        </h2>
      )
    }

    case "heading_3": {
      const heading = block as any
      return (
        <h3 id={id} className="notion-h3 text-2xl font-bold mt-5 mb-2 text-gray-900 dark:text-gray-100">
          <RichText richTexts={heading.heading_3.rich_text} />
        </h3>
      )
    }

    case "paragraph": {
      const paragraph = block as any
      const hasText = paragraph.paragraph.rich_text.length > 0
      return (
        <p className="notion-paragraph my-4 text-gray-800 dark:text-gray-200 leading-relaxed">
          {hasText ? <RichText richTexts={paragraph.paragraph.rich_text} /> : <br />}
        </p>
      )
    }

    case "bulleted_list_item": {
      const listItem = block as any
      return (
        <li className="notion-list-item ml-6 my-1 text-gray-800 dark:text-gray-200">
          <RichText richTexts={listItem.bulleted_list_item.rich_text} />
          {block.children && block.children.length > 0 && (
            <ul className="notion-list mt-1">
              {block.children.map((child) => (
                <Block key={child.id} block={child} />
              ))}
            </ul>
          )}
        </li>
      )
    }

    case "numbered_list_item": {
      const listItem = block as any
      return (
        <li className="notion-list-item ml-6 my-1 text-gray-800 dark:text-gray-200">
          <RichText richTexts={listItem.numbered_list_item.rich_text} />
          {block.children && block.children.length > 0 && (
            <ol className="notion-list-numbered mt-1 list-decimal">
              {block.children.map((child) => (
                <Block key={child.id} block={child} />
              ))}
            </ol>
          )}
        </li>
      )
    }

    case "toggle": {
      const toggle = block as any
      return (
        <details className="notion-toggle my-2 border-l-4 border-gray-300 dark:border-gray-600 pl-4">
          <summary 
            className="cursor-pointer font-medium text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
            onClick={() => setIsToggleOpen(!isToggleOpen)}
          >
            <RichText richTexts={toggle.toggle.rich_text} />
          </summary>
          {block.children && block.children.length > 0 && (
            <div className="mt-2 ml-4">
              {block.children.map((child) => (
                <Block key={child.id} block={child} />
              ))}
            </div>
          )}
        </details>
      )
    }

    case "code": {
      const codeBlock = block as any
      const code = codeBlock.code.rich_text.map((t: any) => t.plain_text).join("")
      const language = codeBlock.code.language || "plaintext"
      const caption = codeBlock.code.caption?.map((t: any) => t.plain_text).join("") || undefined
      return <CodeBlock code={code} language={language} caption={caption} />
    }

    case "quote": {
      const quote = block as any
      return (
        <blockquote className="notion-quote border-l-4 border-gray-800 dark:border-gray-300 pl-4 my-4 italic text-gray-700 dark:text-gray-300">
          <RichText richTexts={quote.quote.rich_text} />
        </blockquote>
      )
    }

    case "callout": {
      const callout = block as any
      const emoji = callout.callout.icon?.emoji || "💡"
      return (
        <div className="notion-callout flex items-start gap-3 p-4 my-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1 text-gray-800 dark:text-gray-200">
            <RichText richTexts={callout.callout.rich_text} />
          </div>
        </div>
      )
    }

    case "divider": {
      return <hr className="notion-divider my-6 border-t border-gray-300 dark:border-gray-600" />
    }

    case "image": {
      const image = block as any
      const imageUrl = image.image.type === "external" 
        ? image.image.external.url 
        : image.image.file.url
      const caption = image.image.caption?.map((t: any) => t.plain_text).join("") || ""
      
      return (
        <figure className="notion-image my-6">
          <div className="relative w-full flex justify-center">
            <img
              src={imageUrl}
              alt={caption || "Image"}
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "600px", objectFit: "contain" }}
              loading="lazy"
            />
          </div>
          {caption && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case "bookmark": {
      const bookmark = block as any
      const url = bookmark.bookmark.url
      const caption = bookmark.bookmark.caption?.map((t: any) => t.plain_text).join("") || url
      
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-bookmark block my-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div className="text-blue-600 dark:text-blue-400 hover:underline">
            {caption}
          </div>
        </a>
      )
    }

    case "link_preview": {
      const linkPreview = block as any
      const url = linkPreview.link_preview.url
      
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-link-preview block my-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div className="text-blue-600 dark:text-blue-400 hover:underline break-all">
            {url}
          </div>
        </a>
      )
    }

    case "table": {
      return (
        <div className="notion-table my-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            <tbody>
              {block.children?.map((row) => (
                <Block key={row.id} block={row} />
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case "table_row": {
      const tableRow = block as any
      return (
        <tr className="border-b border-gray-300 dark:border-gray-600">
          {tableRow.table_row.cells.map((cell: any, index: number) => (
            <td 
              key={index} 
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200"
            >
              <RichText richTexts={cell} />
            </td>
          ))}
        </tr>
      )
    }

    case "to_do": {
      const todo = block as any
      const checked = todo.to_do.checked
      
      return (
        <div className="notion-todo flex items-start gap-2 my-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 cursor-not-allowed"
          />
          <div className={`flex-1 ${checked ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
            <RichText richTexts={todo.to_do.rich_text} />
          </div>
        </div>
      )
    }

    default: {
      console.warn(`Unsupported block type: ${type}`)
      return (
        <div className="notion-unsupported my-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
          지원하지 않는 블록 타입: {type}
        </div>
      )
    }
  }
}

export default Block


import React from "react"
import { RichText as RichTextType } from "src/types/notion"

interface RichTextProps {
  richTexts: RichTextType[]
}

const RichText: React.FC<RichTextProps> = ({ richTexts }) => {
  if (!richTexts || richTexts.length === 0) return null

  return (
    <>
      {richTexts.map((text, index) => {
        let content: React.ReactNode = text.plain_text

        if (text.annotations.bold) {
          content = <strong key={index}>{content}</strong>
        }
        if (text.annotations.italic) {
          content = <em key={index}>{content}</em>
        }
        if (text.annotations.strikethrough) {
          content = <del key={index}>{content}</del>
        }
        if (text.annotations.underline) {
          content = <u key={index}>{content}</u>
        }
        if (text.annotations.code) {
          content = (
            <code
              key={index}
              className="inline-code px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
            >
              {content}
            </code>
          )
        }

        const colorClass = text.annotations.color !== "default" 
          ? `notion-${text.annotations.color}` 
          : ""

        if (text.href || text.text?.link) {
          const url = text.href || text.text?.link?.url
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 dark:text-blue-400 hover:underline ${colorClass}`}
            >
              {content}
            </a>
          )
        }

        return (
          <span key={index} className={colorClass}>
            {content}
          </span>
        )
      })}
    </>
  )
}

export default RichText


import React, { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"

import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-go"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-yaml"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-css"
import "prismjs/components/prism-scss"
import "prismjs/components/prism-sql"

interface CodeBlockProps {
  code: string
  language?: string
  caption?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "plaintext", caption }) => {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const languageMap: { [key: string]: string } = {
    "plain text": "plaintext",
    shell: "bash",
    "c++": "cpp",
    "c#": "csharp",
  }

  const prismLanguage = languageMap[language.toLowerCase()] || language.toLowerCase()

  return (
    <div className="notion-code-block my-4">
      <pre className="!bg-gray-900 !p-4 !rounded-lg overflow-x-auto">
        <code ref={codeRef} className={`language-${prismLanguage}`}>
          {code}
        </code>
      </pre>
      {caption && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          {caption}
        </div>
      )}
    </div>
  )
}

export default CodeBlock


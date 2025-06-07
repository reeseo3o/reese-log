import { useEffect } from "react"
import mermaid from "mermaid"

const useMermaidEffect = () => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Pretendard, Roboto, sans-serif',
      logLevel: 1,
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    })

    if (typeof document === 'undefined') return

    const elements = document.getElementsByClassName("language-mermaid")
    if (!elements.length) return

    Array.from(elements).forEach((element, index) => {
      const content = element.textContent || ""
      if (!content) return

      try {
        mermaid.render(
          `mermaid-${index}`,
          content,
          (svgCode: string) => {
            element.innerHTML = svgCode
          }
        )
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        element.innerHTML = `<div class="text-red-500">Mermaid diagram rendering failed</div>`
      }
    })
  }, [])

  return
}

export default useMermaidEffect

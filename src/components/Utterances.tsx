import { CONFIG } from "site.config"
import { useEffect, useRef } from "react"


type Props = {
  issueTerm: string
}

const Utterances: React.FC<Props> = ({ issueTerm }) => {
  const commentsRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const theme = "github-light"
    if (!commentsRef.current) return

    if (scriptRef.current && commentsRef.current.contains(scriptRef.current)) {
      commentsRef.current.removeChild(scriptRef.current)
    }

    scriptRef.current = document.createElement("script")
    const script = scriptRef.current

    script.setAttribute("src", "https://utteranc.es/client.js")
    script.setAttribute("crossorigin", "anonymous")
    script.setAttribute("async", "true")
    script.setAttribute("theme", theme)
    
    const { repo, label, ref } = CONFIG.utterances.config
    script.setAttribute("repo", repo)
    if (label) script.setAttribute("label", label)
    if (ref) script.setAttribute("ref", ref)
    
    script.setAttribute("issue-term", issueTerm)
    
    commentsRef.current.appendChild(script)
    
    return () => {
      if (scriptRef.current && commentsRef.current?.contains(scriptRef.current)) {
        commentsRef.current.removeChild(scriptRef.current)
      }
    }
  }, [issueTerm])

  return (
    <>
      <div ref={commentsRef} className="md:-ml-16">
        <div className="utterances-frame"></div>
      </div>
    </>
  )
}

export default Utterances

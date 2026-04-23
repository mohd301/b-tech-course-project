
import { useState, useRef, useEffect } from "react"
import {Card, CardBody, CardFooter} from 'reactstrap'
import { useTheme } from "../compsMisc/ThemeContext"
import { IoIosSend } from "react-icons/io";
const SYSTEM_PROMPT = "You are a helpful assistant that will help the user of this website to apply for a subsidy or the map or to change their password. If any unrelated message is given say: not in my scope!"

export default function LLm() {
    const {theme}=useTheme()
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I can help you apply for a subsidy, find something on the map, or change your password. What would you like to do?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: "user", content: input.trim() }
    const updatedHistory = [...messages, userMsg]

    setMessages(updatedHistory)
    setInput("")
    setLoading(true)

    // Add empty assistant bubble to stream into
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      const res = await fetch('http://127.0.0.1:11434/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3.5:4b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedHistory
          ],
          stream: true,
        }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value, { stream: true }).split("\n")
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const json = JSON.parse(line)
            if (json.message?.content) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + json.message.content
                }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: "assistant", content: "Error: make sure Ollama is running with CORS enabled." }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
        <Card style={{width:"18rem"}}>
      

      {/* Messages */}
      <CardBody style={{height:"26rem",background:theme.primaryBackground, overflowY: "auto"}}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "8px 12px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? theme.primaryColor : theme.secondaryColor,
              color: msg.role === "user" ? theme.textColorAlt : theme.textColorBlack,
              fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
              
            }}>
              {msg.content || (loading && i === messages.length - 1 ? "?" : "")}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "8px 14px", background: "#ff0000", borderRadius: "14px 14px 14px 4px", fontSize: 18, letterSpacing: 2 }}>···</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardBody>

      {/* Input */}
      <CardFooter style={{ padding: 12, display: "flex", gap: 8, }}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Type a message…"
          style={{ flex: 1, resize: "none", padding: "8px 12px", borderRadius: 20, border: "1px solid #ddd", fontSize: 14, lineHeight: 1.5, maxHeight: 120, overflowY: "auto", outline: "none", fontFamily: "inherit" }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
   
          style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: theme.altBackground, color: theme.primaryColor, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: loading || !input.trim() ? 0.4 : 1 }}
        >
          <IoIosSend/>
        </button>
      </CardFooter>
      </Card>
    </div>
  )
}
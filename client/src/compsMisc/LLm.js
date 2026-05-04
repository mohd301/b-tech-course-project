import { useState, useRef, useEffect } from "react"
import { Card, CardBody, CardFooter } from "reactstrap"
import { useTheme } from "../compsMisc/ThemeContext"
import { IoIosSend } from "react-icons/io"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `http://localhost:${process.env.REACT_APP_PORT || "7500"}`

export default function LLm({ onClose }) {
  const { theme } = useTheme()
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

  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = "0px"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
  }, [input])

  const send = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || loading) return

    const userMsg = { role: "user", content: trimmedInput }
    const updatedHistory = [...messages, userMsg]

    setMessages([...updatedHistory, { role: "assistant", content: "" }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/llm/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
        }),
      })

      if (!res.ok || !res.body) {
        const serverMessage = await res.text()
        throw new Error(serverMessage || "LLM request failed")
      }

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
          } catch {
            // Ignore partial streaming chunks that are not valid JSON yet.
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: error.message || "Error: Gemini request failed."
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="llmChatShell">
      <Card className="llmChatCard">
        <div
          className="llmChatHeader"
          style={{
            background: theme.altBackground,
            color: theme.textColorAlt,
            borderBottomColor: theme.shadowColor,
          }}
        >
          <div>
            <h2 className="llmChatTitle">Chat assistant</h2>
            <p className="llmChatSubtitle">Ask about subsidies, the map, or your password.</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="llmChatClose"
              aria-label="Hide chat assistant"
              style={{
                color: theme.textColorAlt,
                borderColor: theme.shadowColor,
                background: theme.primaryBackground,
              }}
            >
              Hide
            </button>
          ) : null}
        </div>

        <CardBody
          className="llmChatMessages"
          style={{ background: theme.primaryBackground }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`llmMessageRow ${msg.role === "user" ? "llmMessageRowUser" : "llmMessageRowAssistant"}`}
            >
              <div
                className={`llmMessageBubble ${msg.role === "user" ? "llmMessageBubbleUser" : "llmMessageBubbleAssistant"}`}
                style={{
                  background: msg.role === "user" ? theme.primaryColor : theme.altBackground,
                  color: theme.textColorAlt,
                }}
              >
                {msg.content || (loading && i === messages.length - 1 ? "Typing..." : "")}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardBody>

        <CardFooter
          className="llmChatFooter"
          style={{ background: theme.altBackground, borderTopColor: theme.shadowColor }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            className="llmChatInput"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Type a message..."
            style={{
              background: theme.primaryBackground,
              color: theme.textColorAlt,
              borderColor: theme.shadowColor,
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="llmChatSend"
            aria-label="Send message"
            style={{
              background: theme.primaryColor,
              color: theme.textColorAlt,
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
          >
            <IoIosSend />
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}

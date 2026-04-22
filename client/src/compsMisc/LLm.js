import { Button, Card, CardBody, CardFooter } from "reactstrap"
import { useState } from "react"

export default function LLm() {
    const [umessage, Setusermessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setIsLoading] = useState(false);

    async function LLmCall() {
        if (!umessage) return;
        setResponse("");
        setIsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen3.5:4b',
                    messages: [
                        { role: 'system', content: "You are a helpful assistant that will help the user of this website to apply for a subsidy or the map or to change their password if any unralated message is given say not in my scope!" },
                        { role: "user", content: umessage }
                    ],
                    stream: true,
                }),
            });
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        setResponse((prev) => prev + json.message.content);
                    }
                }
            }
        } catch (err) {
            setResponse("Error: Ensure Ollama is running with OLLAMA_ORIGINS='*'");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardBody>
                {response
                    ? <div>{response}</div>
                    : <span className="text-muted">Response will appear here...</span>
                }
            </CardBody>
            <CardFooter>
                <input
                    value={umessage}
                    onChange={(e) => Setusermessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && LLmCall()}
                />
                <Button onClick={LLmCall} disabled={loading}>
                    {loading ? "Thinking..." : "Send"}
                </Button>
            </CardFooter>
        </Card>
    );
}
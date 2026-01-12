import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatBoxProps = {
  page: string;
  className?: string;
};

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Fala! Me conte como esta sua rotina hoje, se houve algum desconforto e o que voce quer ajustar.",
};

export function ChatBox({ page, className }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const { response } = await api.sendChatMessage({ message: trimmed, page });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response || "Nao consegui responder agora.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Nao consegui responder agora. Tente novamente.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={cn("p-4 space-y-4 border-border", className)}>
      <div>
        <h3 className="font-display text-lg text-foreground">Fale com o coach IA</h3>
        <p className="text-sm text-muted-foreground">
          Ajuste treino, dieta e seus dados com base na sua rotina.
        </p>
      </div>

      <ScrollArea className="h-52 rounded-xl border border-border bg-background/60 p-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {message.content}
            </div>
          ))}
          {isSending && (
            <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-secondary text-muted-foreground">
              Digitando...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Digite sua mensagem"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <Button variant="fitness" onClick={handleSend} disabled={isSending}>
          Enviar
        </Button>
      </div>
    </Card>
  );
}

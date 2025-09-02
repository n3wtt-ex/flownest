import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMessage = { id: string; role: "user" | "bot"; text: string; mode?: "work" | "ask" };

export function ChatBox({ onModeChange }: { onModeChange: (mode: "work" | "ask") => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "user", text: "NYC AI SaaS leadleri bul ve kampanya hazırla" },
    { id: "2", role: "bot", text: "Filtreleniyor… 32 sonuç bulundu." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"work" | "ask">("work");

  const send = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = { id: String(Date.now()), role: "user", text: input, mode };
    setMessages((m) => [...m, msg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: "bot", text: "(demo) Görev kuyruğa alındı." }]);
      setTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4 rounded-lg">
      <div className="flex-1 space-y-2 overflow-auto pr-1">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                m.role === "user"
                  ? "inline-block px-3 py-2 rounded-full bg-blue-600 text-white text-sm"
                  : "inline-block px-3 py-2 rounded-2xl bg-gray-800 text-white border border-gray-700 text-sm"
              }
            >
              {m.text}
              {m.mode && m.role === "user" && (
                <span className="ml-2 text-[10px] text-blue-300">{m.mode.toUpperCase()}</span>
              )}
            </span>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1 text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:120ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:240ms]" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input
          placeholder={`${mode === "work" ? "Work" : "Ask"}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="bg-gray-800 text-white border-gray-700 focus:border-blue-500"
        />
        <Button onClick={send} className="bg-blue-600 hover:bg-blue-700">Gönder</Button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="hero"
          onClick={() => {
            setMode("work");
            onModeChange("work");
          }}
          className="rounded-full bg-blue-600 hover:bg-blue-700"
        >
          Work
        </Button>
        <Button
          variant="outlineGlow"
          onClick={() => {
            setMode("ask");
            onModeChange("ask");
          }}
          className="rounded-full border border-gray-600 text-white hover:bg-gray-800"
        >
          Ask
        </Button>
      </div>
    </div>
  );
}
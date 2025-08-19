"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});

export default function ChatClient() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ WebSocket client connected:", socket.id);
    });

    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("message", input); 
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Chat</h1>
      <div className="border h-64 overflow-y-auto p-2 my-2">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="border p-2 w-full bg-white text-black"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
      >
        Send
      </button>
    </div>
  );
}

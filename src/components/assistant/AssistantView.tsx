"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, HelpCircle, MessageSquareQuote } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const AssistantView: React.FC = () => {
  const { items } = useCart();
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string }>
  >([
    {
      sender: "bot",
      text: "Hello! I am your Gemma AI Shopping Assistant. How can I help you find items in the store today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `I noticed you have ${items.length} items in your cart. For "${userText}", I recommend checking Aisle 3 (Dairy & Pantry) or asking a store associate.`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Gemma AI Shopping Assistant
          </h2>
          <p className="text-xs text-slate-500">
            Ask for store navigation, dietary info, or product availability
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setInputValue("Where can I find gluten-free bread?")}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
          Where is gluten-free bread?
        </button>

        <button
          type="button"
          onClick={() => setInputValue("Are there any discounts on dairy today?")}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Dairy discounts today?
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[260px] max-h-[360px] overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 text-xs ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-sky-600 text-white font-medium shadow-2xs"
                  : "bg-white text-slate-800 border border-slate-200 shadow-2xs"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question for Gemma AI..."
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
          <MessageSquareQuote className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-5 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};

export default AssistantView;

"use client";

import React, { useState } from "react";
import {
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Loader2,
  Globe,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { ChatMessage } from "@/types";
import { sendChatMessage } from "@/lib/api";

export interface ChatWindowProps {
  onSelectMessage?: (msg: ChatMessage) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onSelectMessage }) => {
  const { setActiveTab } = useCart();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init-1",
      sender: "assistant",
      text: "Hello! I am your Gemma AI Shopping Assistant. How can I assist you with product locations, dietary recommendations, or aisle routes today?",
      timestamp: new Date().toLocaleTimeString(),
      toolActivity: [
        { step: "🧠 Intent Analysis", action: "Initialized chat session" },
        { step: "✓ Response Synthesized", action: "Ready for queries" },
      ],
    },
  ]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setIsProcessing(true);

    try {
      const botResponse = await sendChatMessage(textToSend);
      setMessages((prev) => [...prev, botResponse]);
      onSelectMessage?.(botResponse);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: "AI Assistant service unavailable. Please check your backend connection or try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowOnMap = (aisle: string) => {
    // Navigate to Store Map tab smoothly while preserving target aisle context
    if (aisle) {
      setActiveTab("map");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white flex flex-col h-full min-h-[540px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">
              Gemma AI Voice & Chat Engine
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Autonomous Function Orchestration
            </p>
          </div>
        </div>

        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMicActive(!isMicActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            isMicActive
              ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse shadow-sm"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          {isMicActive ? (
            <>
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Mic Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 overflow-y-auto space-y-4 max-h-[380px]">
        {messages.map((msg) => {
          const isBot = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              onClick={() => isBot && onSelectMessage?.(msg)}
              className={`flex items-start gap-3 text-xs cursor-pointer ${
                isBot ? "justify-start" : "justify-end"
              }`}
            >
              {isBot && (
                <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] space-y-2.5 ${
                  isBot
                    ? "bg-slate-900 border border-slate-800 text-slate-200 shadow-md"
                    : "bg-sky-600 text-white font-medium shadow-md"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>

                {/* Web Research Indicator Badge */}
                {isBot && msg.webSearchUsed && (
                  <div className="inline-flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    Web Grounded Knowledge Used
                  </div>
                )}

                {/* Action Button: SHOW ON MAP */}
                {isBot && msg.targetAisle && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowOnMap(msg.targetAisle!);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>SHOW ON MAP ({msg.targetAisle})</span>
                    </button>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono text-right">
                  {msg.timestamp}
                </div>
              </div>

              {!isBot && (
                <div className="p-1.5 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Typing Indicator */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Gemma AI is reasoning & querying catalog...</span>
          </div>
        )}
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Action Suggestions
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSendMessage("Where is Amul Butter?")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Where is Amul Butter?
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage("Find snacks under ₹50")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Find snacks under ₹50
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage("What pairs well with Maggi?")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            What pairs well with Maggi?
          </button>
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isMicActive
              ? "Listening to voice input..."
              : "Type your query for Gemma AI..."
          }
          disabled={isProcessing}
          className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isProcessing}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

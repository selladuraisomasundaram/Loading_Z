"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Mic,
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
  const { setActiveTab, setAssistantTargetProduct } = useCart();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recognizerRef = React.useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init-1",
      sender: "assistant",
      text: "Hello! I am your Gemma AI Shopping Assistant. How can I assist you with product locations, dietary recommendations, or store catalog queries today?",
      timestamp: new Date().toLocaleTimeString(),
      toolActivity: [
        { step: "🧠 Intent Analysis", action: "Initialized chat session" },
        { step: "✓ Response Synthesized", action: "Ready for queries" },
      ],
    },
  ]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMic = () => {
    // Stop any ongoing speech when interacting with mic
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (isMicActive) {
      setIsMicActive(false);
      setLiveTranscript("");
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("Web Speech API not supported in this browser.");
        return;
      }

      setIsMicActive(true);
      setLiveTranscript("");

      const recognizer = new SpeechRecognition();
      recognizerRef.current = recognizer;
      recognizer.lang = "en-US";
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;

      recognizer.onresult = (event: any) => {
        let interim = "";
        let finalStr = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        const transcriptStr = finalStr || interim;
        setLiveTranscript(transcriptStr);
        
        if (finalStr.trim()) {
          try { recognizer.stop(); } catch(e) {}
          setIsMicActive(false);
          handleSendMessage(finalStr.trim());
        }
      };

      recognizer.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        if (e.error !== 'no-speech') {
          setIsMicActive(false);
        }
      };

      recognizer.onend = () => {
        setIsMicActive(false);
      };

      try {
        recognizer.start();
      } catch (e) {
        console.error("Mic start error:", e);
        setIsMicActive(false);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isProcessing) return;

    // Stop TTS if user sends a message manually
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

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
      
      // Speak the bot response
      speakText(botResponse.text);
      
      if (botResponse.targetAisle || botResponse.targetProductId) {
        setAssistantTargetProduct({
          id: botResponse.targetProductId || "assistant-item",
          name: botResponse.targetProductName || "Searched Item",
          price: 0,
          weightGrams: 0,
          category: "Assistant Search",
          aisleId: botResponse.targetAisle
        });
        setActiveTab("map");
      }
      
      onSelectMessage?.(botResponse);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: "AI Assistant service unavailable. Please check your backend connection or try again.",
        timestamp: new Date().toLocaleTimeString(),
        toolActivity: [{ step: "Network Error", action: "Failed to connect to backend", result: "Timeout" }],
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text);
    } finally {
      setIsProcessing(false);
    }
  };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowOnMap = (_aisle: string) => {
    setActiveTab("map");
  };

  // Get the last bot message to display as feedback
  const lastBotMessage = [...messages].reverse().find(m => m.sender === "assistant");

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative items-center justify-center p-8">
      
      {/* Central Voice Status / Feedback Area */}
      <div className="mb-12 text-center h-24 max-w-md w-full flex items-center justify-center">
         {isProcessing ? (
           <p className="text-purple-400 animate-pulse text-lg font-medium flex items-center gap-2 justify-center">
             <Loader2 className="w-6 h-6 animate-spin" />
             Finding product and reasoning...
           </p>
         ) : isMicActive ? (
           <div className="space-y-2">
             <p className="text-rose-400 animate-pulse text-2xl font-bold">Listening...</p>
             <p className="text-slate-400 text-sm">
                {liveTranscript ? `"${liveTranscript}"` : "Speak your request clearly"}
             </p>
           </div>
         ) : (
           <div className="space-y-2">
             <p className="text-slate-300 text-sm font-medium leading-relaxed italic opacity-90 line-clamp-3">
               "{lastBotMessage ? lastBotMessage.text : "Tap to speak with Gemma"}"
             </p>
             {lastBotMessage?.targetAisle && (
               <button
                 onClick={() => handleShowOnMap(lastBotMessage.targetAisle!)}
                 className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
               >
                 <MapPin className="w-3.5 h-3.5" />
                 Show Route on Map
               </button>
             )}
           </div>
         )}
      </div>

      {/* Central Mic Button */}
      <button
        onClick={toggleMic}
        className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group ${
          isMicActive
            ? "bg-rose-500 text-white animate-pulse shadow-[0_0_60px_-10px_rgba(244,63,94,0.6)] scale-110"
            : isProcessing
            ? "bg-amber-500 text-white shadow-[0_0_60px_-10px_rgba(245,158,11,0.6)]"
            : "bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white hover:scale-105 shadow-[0_0_40px_-10px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_-10px_rgba(147,51,234,0.6)]"
        }`}
      >
        <Bot className={`w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isProcessing ? "animate-bounce" : isMicActive ? "opacity-0 scale-50" : "opacity-100 scale-100 group-hover:scale-110"}`} />
        <Mic className={`w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isMicActive ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-50"}`} />
      </button>

      {/* Text Bubble Suggestions */}
      <div className="mt-20 w-full max-w-md">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-center mb-6">
          Suggestions
        </span>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => handleSendMessage("Where is Amul Butter?")}
            className="px-5 py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 justify-center"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            "Where is Amul Butter?"
          </button>
          
          <button
            type="button"
            onClick={() => handleSendMessage("Find snacks under ₹50")}
            className="px-5 py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 justify-center"
          >
            <Sparkles className="w-5 h-5 text-sky-400" />
            "Find snacks under ₹50"
          </button>
          
          <button
            type="button"
            onClick={() => handleSendMessage("What pairs well with Maggi?")}
            className="px-5 py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 justify-center"
          >
            <Globe className="w-5 h-5 text-cyan-400" />
            "What pairs well with Maggi?"
          </button>
        </div>
      </div>
      
      {/* Hidden abstract elements - preserving state array structurally for hook compatibility */}
      <div className="hidden">
        {messages.length}
      </div>
    </div>
  );
};

export default ChatWindow;

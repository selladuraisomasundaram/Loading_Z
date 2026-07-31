"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Mic,
  Sparkles,
  MapPin,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { ChatMessage, Product } from "@/types";
import { sendChatMessage, sendAudioMessage } from "@/lib/api";

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
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
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

  const recognitionRef = React.useRef<any>(null);

  const toggleMic = async () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (isMicActive) {
      setIsMicActive(false);
      setLiveTranscript("Processing audio...");
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Initialize SpeechRecognition for LIVE frontend transcript feedback
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              currentTranscript += event.results[i][0].transcript;
            }
            setLiveTranscript(currentTranscript || "Listening (recording audio)...");
          };
          recognition.start();
          recognitionRef.current = recognition;
        }

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          handleSendAudioMessage(audioBlob);
          // Stop all tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());
          if (recognitionRef.current) recognitionRef.current.stop();
        };

        // Pass 250ms timeslice to ensure audio chunks are flushed reliably
        mediaRecorder.start(250);
        setIsMicActive(true);
        setLiveTranscript("Listening (recording audio)...");
      } catch (err) {
        console.error("Microphone access error:", err);
        setLiveTranscript("Error: Microphone access denied or unavailable.");
        setTimeout(() => setLiveTranscript(""), 3000);
      }
    }
  };

  const handleSendAudioMessage = async (audioBlob: Blob) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const { message: botResponse, audioUrl, transcribedText } = await sendAudioMessage(audioBlob);
      
      // Add the user's transcribed message to the chat visually
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: "user",
        text: transcribedText || "Audio message",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLiveTranscript("");
      
      // Add bot response
      setMessages((prev) => [...prev, botResponse]);
      
      // Play the generated audio file
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Audio play error", e));
      
      if (botResponse.targetAisle || botResponse.targetProductId) {
        const prod: Product = {
          id: botResponse.targetProductId || "assistant-item",
          productId: botResponse.targetProductId || "assistant-item",
          name: botResponse.targetProductName || "Searched Item",
          productName: botResponse.targetProductName || "Searched Item",
          price: 0,
          weightGrams: 0,
          category: "Assistant Search",
          aisleId: botResponse.targetAisle || "Aisle A1",
          mapX: 510,
          mapY: 95,
          availability: "In Stock"
        };
        setAssistantTargetProduct(prod);
        setActiveTab("map");
      }
      
      onSelectMessage?.(botResponse);
    } catch (e: any) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: "Audio service unavailable. Please ensure the backend is running with Whisper installed.",
        timestamp: new Date().toLocaleTimeString(),
        toolActivity: [{ step: "Network Error", action: "Failed to process audio", result: "Timeout" }],
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text);
      setLiveTranscript("");
    } finally {
      setIsProcessing(false);
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
      
      if (botResponse.targetProduct || botResponse.targetAisle || botResponse.targetProductId) {
        const prod: Product = botResponse.targetProduct || {
          id: botResponse.targetProductId || "assistant-item",
          productId: botResponse.targetProductId || "assistant-item",
          name: botResponse.targetProductName || "Searched Item",
          productName: botResponse.targetProductName || "Searched Item",
          price: 0,
          weightGrams: 0,
          category: "Assistant Search",
          aisleId: botResponse.targetAisle || "Aisle A3",
          mapX: 510,
          mapY: 95,
          availability: "In Stock"
        };
        // Only auto-navigate for in-stock / low-stock products.
        // Out-of-stock products can be shown via "Show location anyway" button.
        const availability = prod.availability || "In Stock";
        if (availability !== "Out of Stock") {
          setAssistantTargetProduct(prod);
        }
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
              <p className="text-slate-300 text-sm font-medium leading-relaxed opacity-90">
                "{lastBotMessage ? lastBotMessage.text : "Tap to speak with Gemma"}"
              </p>

              {/* Multi-Match Product Selection Chips */}
              {lastBotMessage?.multipleMatches && lastBotMessage.multipleMatches.length > 1 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Select a matching product:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {lastBotMessage.multipleMatches.map((m: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const target: Product = {
                            id: m.id || m.sku || `SKU-${idx}`,
                            productId: m.id || m.sku || `SKU-${idx}`,
                            name: m.product_name || m.name,
                            productName: m.product_name || m.name,
                            price: m.price || m.sale_price || 0,
                            weightGrams: 0,
                            category: m.category || "Grocery",
                            aisleId: m.aisle || "Aisle A1",
                            mapX: m.x || 510,
                            mapY: m.y || 95,
                            availability: (m.stock > 0 ? "In Stock" : "Out of Stock") as "In Stock" | "Out of Stock"
                          };
                          setAssistantTargetProduct(target);
                          setActiveTab("map");
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 border border-slate-700 text-sky-300 hover:text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>📍 {m.product_name || m.name}</span>
                        <span className="text-[10px] opacity-75">({m.aisle || "Aisle 1"})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {lastBotMessage?.targetAisle && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleShowOnMap(lastBotMessage.targetAisle!)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    View Route on Map
                  </button>

                  {/* Show location anyway button for out-of-stock products */}
                  {lastBotMessage?.targetProduct?.availability === "Out of Stock" && (
                    <button
                      onClick={() => {
                        if (lastBotMessage.targetProduct) {
                          setAssistantTargetProduct(lastBotMessage.targetProduct as Product);
                          setActiveTab("map");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl shadow-sm transition-all border border-slate-600"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Show location anyway
                    </button>
                  )}

                  {/* Stock status badge */}
                  {lastBotMessage?.targetProduct && (
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                      lastBotMessage.targetProduct.availability === "Out of Stock"
                        ? "bg-red-900/50 text-red-300 border border-red-700"
                        : lastBotMessage.targetProduct.availability === "Low Stock"
                        ? "bg-amber-900/50 text-amber-300 border border-amber-700"
                        : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
                    }`}>
                      {lastBotMessage.targetProduct.availability || "In Stock"} ({lastBotMessage.targetProduct.stock ?? "?"} units)
                    </span>
                  )}
                </div>
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
      <div className="mt-16 w-full max-w-md">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-center mb-4">
          Phase 3 Test Queries
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleSendMessage("Where is Maggi?")}
            className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            "Where is Maggi?"
          </button>
          
          <button
            type="button"
            onClick={() => handleSendMessage("Where is Aashirvaad Atta?")}
            className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            "Aashirvaad Atta?"
          </button>
          
          <button
            type="button"
            onClick={() => handleSendMessage("Show me biscuits")}
            className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            "Show me biscuits"
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage("Where is shampoo?")}
            className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            "Where is shampoo?"
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

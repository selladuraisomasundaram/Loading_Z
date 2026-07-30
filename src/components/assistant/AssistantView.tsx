"use client";

import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ToolActivityPanel from "./ToolActivityPanel";
import WebResearchCard from "./WebResearchCard";
import { ChatMessage } from "@/types";

export const AssistantView: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Chat Thread & Message Input (7 cols) */}
      <div className="lg:col-span-7">
        <ChatWindow
          onSelectMessage={(msg) => setSelectedMessage(msg)}
        />
      </div>

      {/* RIGHT COLUMN: Tool Activity Panel & Web Research Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <ToolActivityPanel
          toolSteps={selectedMessage?.toolActivity}
        />

        <WebResearchCard
          researchData={selectedMessage?.webSearchResults}
        />
      </div>
    </div>
  );
};

export default AssistantView;

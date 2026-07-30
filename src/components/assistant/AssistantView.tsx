"use client";

import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import { ChatMessage } from "@/types";

export const AssistantView: React.FC = () => {
  const [_selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Chat Thread & Message Input (12 cols now) */}
      <div className="lg:col-span-12">
        <ChatWindow
          onSelectMessage={(msg) => setSelectedMessage(msg)}
        />
      </div>
    </div>
  );
};

export default AssistantView;

"use client";
import AiTaskChatBox from "@/components/ChatBox/AiTaskChatBox";
import Header from "@/components/Header";

export default function ChatPage() {
  return (
    <div className="container h-full w-full p-8">
      <Header name="AI Task Chat" />
      <div className="mt-6 flex justify-center">
        <AiTaskChatBox />
      </div>
    </div>
  );
}

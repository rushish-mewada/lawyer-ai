'use client'

import { SiGooglegemini } from "react-icons/si";
import { useAppSelector } from "@/lib/hooks";
import TypingIndicator from "./TypingIndicator";
import { useEffect, useRef } from "react";
import { FiFileText } from "react-icons/fi";

const MessageDisplay = () => {
    const { messages, isLoading } = useAppSelector((state) => state.chat);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                    {msg.from === 'gemini' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                            <SiGooglegemini />
                        </div>
                    )}
                    <div className={`p-4 rounded-xl ${msg.from === 'user' ? 'max-w-2xl bg-blue-600 text-white' : 'max-w-4xl glass !bg-white/10 text-white/90'}`}>
                        {msg.attachment?.type === 'image' && (
                            <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-xs rounded-lg mb-2" />
                        )}
                        {msg.attachment && msg.attachment.type !== 'image' && (
                            <div className="p-2 rounded-md bg-white/10 flex items-center gap-2 mb-2">
                                <FiFileText />
                                <span>{msg.attachment.name}</span>
                            </div>
                        )}
                        {typeof msg.content === 'object' && msg.content !== null ? (
                            <div>
                                <p className="whitespace-pre-wrap">{msg.content.main}</p>
                                <p className="mt-4 text-sm text-white/70 italic">{msg.content.disclaimer}</p>
                            </div>
                        ) : (
                            <p>{String(msg.content)}</p>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={endOfMessagesRef} />
        </div>
    );
}

export default MessageDisplay;
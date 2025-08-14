'use client'

import React from 'react';
import ChatPanel from "../chatPanel/chatPanel";
import Sidebar from "../sidebar/sidebar";
import './blobs.css';

interface ChatsLayoutProps {
    children?: React.ReactNode;
}

const ChatsLayout = ({ children }: ChatsLayoutProps) => {
    return (
        <div className="relative w-full h-screen">
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="relative z-10 flex h-[100vh]">
                <Sidebar />
                <div className="flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default ChatsLayout;
'use client'

import Link from 'next/link';
import { FaBars } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import { FiEdit, FiTrash2, FiLogOut } from "react-icons/fi";
import { IoChatbubbles } from "react-icons/io5";
import { RiChatNewFill } from "react-icons/ri";
import Popover from "../popover/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleSidebar } from "@/lib/features/ui/uiSlice";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
    const chats = [
        { id: 'chat1', title: 'Chat 1' },
        { id: 'chat2', title: 'Chat 2' },
        { id: 'chat3', title: 'Chat 3' }
    ];
    const router = useRouter();

    const handleLogout = async () => {
        const auth = getAuth(app);
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const ChatMenuContent = () => (
        <div className="glass !bg-[#000]/80 rounded-md shadow-lg p-2">
            <ul>
                <li>
                    <button className="w-full text-left p-2 text-sm text-white/90 rounded hover:bg-white/20 flex items-center gap-3">
                        <FiEdit /> Rename
                    </button>
                </li>
                <li>
                    <button className="w-full text-left p-2 text-sm text-red-400 rounded hover:bg-white/20 flex items-center gap-3">
                        <FiTrash2 /> Delete
                    </button>
                </li>
            </ul>
        </div>
    );

    return (
        <div className={`${isSidebarOpen ? "w-[20rem] min-w-[20rem] max-w-[20rem] " : "w-[4rem] min-w-[4rem] max-w-[4rem] "} flex-shrink-0 min-h-[100vh] bg-white/10 backdrop-blur-2xl border-r border-white/20 p-4 overflow-hidden transition-all duration-300 flex flex-col`}>
            <FaBars
                size={24}
                className="absolute w-[20px] h-[20px] top-6 left-5 text-white cursor-pointer"
                onClick={() => dispatch(toggleSidebar())}
            />
            <br />
            <div className={`flex-grow p-6 mt-2 transition-opacity duration-500 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                {isSidebarOpen && (
                    <>
                        <button className="w-full p-2 mb-5 rounded-lg text-gray-900 font-semibold bg-white hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-3 justify-center shadow-md">
                            <RiChatNewFill className="text-xl" /> New Chat
                        </button>
                        <div className="border-t border-white/20 my-4"></div>
                        <h1 className="text-xl text-white/80 font-medium mb-4 flex items-center gap-2"><IoChatbubbles /> Your Chats</h1>
                        <ul>
                            {chats.map((chat) =>
                                <li key={chat.id} className="glass mb-5 flex items-center justify-between text-white/90">
                                    <Link href={`/chat/${chat.id}`} className="flex-grow cursor-pointer">
                                        {chat.title}
                                    </Link>
                                    <Popover
                                        popoverId={`chat-menu-${chat.id}`}
                                        side="bottom"
                                        align="end"
                                        sideOffset={0}
                                        alignOffset={0}
                                        width={150}
                                        trigger={
                                            <button className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Chat options">
                                                <SlOptions />
                                            </button>
                                        }
                                        content={<ChatMenuContent />}
                                    />
                                </li>
                            )}
                        </ul>
                    </>
                )}
            </div>
            <div className={`p-6 transition-opacity duration-500 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                {isSidebarOpen && (
                    <button
                        onClick={handleLogout}
                        className="w-full p-2 text-white rounded-lg bg-red-900/50 backdrop-blur-md shadow-lg border border-white/20 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer flex items-center gap-3 justify-center"
                    >
                        <FiLogOut /> Logout
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
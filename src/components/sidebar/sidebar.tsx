'use client'

import { FaBars } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { IoChatbubbles } from "react-icons/io5";
import Popover from "../popover/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleSidebar } from "@/lib/features/ui/uiSlice";

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
    const chats = Array(5).fill("Chat 1");

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
        <div className={`${isSidebarOpen ? "w-[20rem]" : "w-[4rem]"} min-h-[100vh] bg-white/10 backdrop-blur-2xl border-r border-white/20 p-4 overflow-hidden transition-all duration-300`}>
            <FaBars
                size={24}
                className="absolute w-[20px] h-[20px] top-6 left-5 text-white cursor-pointer"
                onClick={() => dispatch(toggleSidebar())}
            />
            <br />
            <div className={`p-6 mt-2 transition-opacity duration-500 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                {isSidebarOpen && (
                    <>
                        <h1 className="text-xl text-white/80 font-light mb-4 flex items-center gap-2"><IoChatbubbles /> Chats</h1>
                        <ul>
                            {chats.map((chat, i) =>
                                <li key={i} className="glass mb-5 cursor-pointer flex items-center justify-between text-white/90">
                                    {chat}
                                    <Popover
                                        popoverId={`chat-menu-${i}`}
                                        side="bottom"
                                        align="end"
                                        sideOffset={0}
                                        alignOffset={0}
                                        width={150}
                                        trigger={
                                            <button className="p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Chat options">
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
        </div>
    );
};

export default Sidebar;
'use client'
import { FaBars } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import { IoChatbubbles } from "react-icons/io5";
import { useState } from "react";

const Sidebar = () => {

    const [isOpen, setisOpen] = useState(false);
    const chats = Array(5).fill("Chat 1");

    return (
        <div className={`${isOpen ? "w-[20rem]" : "w-[4rem]"} min-h-[100vh] bg-white/10 backdrop-blur-2xl border-r border-white/20 p-4 overflow-hidden transition-all duration-300`}>
            <FaBars
                size={24}
                className="absolute w-[20px] h-[20px] top-6 left-5 text-white cursor-pointer"
                onClick={() => setisOpen(!isOpen)}
            />
            <br />
            <div
                className={`p-8 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                {isOpen && (
                    <>
                        <h1 className="text-xl text-white/80 font-light mb-4 flex items-center gap-2"><IoChatbubbles /> Chats</h1>
                        <ul>
                            {chats.map((chat, i) =>
                                <li key={i} className="glass mb-5 cursor-pointer flex items-center justify-between text-white/90">{chat} <SlOptions /></li>
                            )}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
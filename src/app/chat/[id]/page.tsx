import ChatPanel from "@/components/chatPanel/chatPanel";
import Sidebar from "@/components/sidebar/sidebar";
import './blobs.css';

const Chats = () => {
    return (
        <div className="relative w-full h-screen">
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="relative z-10 flex h-[100vh]">
                <Sidebar />
                <ChatPanel />
            </div>
        </div>
    );
}

export default Chats;
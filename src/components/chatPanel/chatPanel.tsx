import Header from "../header/header";
import ChatInput from "./chat";
import MessageDisplay from "./MessageDisplay";

const ChatPanel = () => {
    return (
        <div className="w-full h-screen flex flex-col p-6">
            <Header />
            <MessageDisplay />
            <ChatInput />
        </div>
    );
}

export default ChatPanel;
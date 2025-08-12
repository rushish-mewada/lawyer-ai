import { SiGooglegemini } from "react-icons/si";

const TypingIndicator = () => {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <SiGooglegemini />
            </div>
            <div className="p-4 rounded-xl max-w-2xl glass !bg-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-300"></span>
            </div>
        </div>
    );
}

export default TypingIndicator;
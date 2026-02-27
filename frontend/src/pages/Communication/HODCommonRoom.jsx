import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Users } from 'lucide-react';

export default function HODCommonRoom() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');

    // Empty Messages for the HoD Common Room
    const [messages, setMessages] = useState([]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setMessages([...messages, {
            id: Date.now(),
            senderName: user.name,
            senderTag: user.tag,
            department: user.department_id || 'Global',
            content: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">

            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        HOD Common Room
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Restricted Channel: Deans, HODs, and Administrators.
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((msg) => {
                    const isOwn = msg.senderName === user.name;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                {/* Sender Info Line */}
                                <div className="flex items-baseline space-x-2 mb-1">
                                    <span className="text-sm font-semibold text-slate-700">{msg.senderName}</span>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-1.5 rounded">{msg.senderTag}</span>
                                    {!isOwn && <span className="text-xs text-slate-400 italic">| {msg.department}</span>}
                                </div>

                                {/* Bubble */}
                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isOwn ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex space-x-3">
                    <input
                        type="text"
                        className="flex-1 border-slate-300 rounded-full focus:ring-primary focus:border-primary px-4 py-2 border shadow-sm text-sm"
                        placeholder="Broadcast a message to all HODs..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>

        </div>
    );
}

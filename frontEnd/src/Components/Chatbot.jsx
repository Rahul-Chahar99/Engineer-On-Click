import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Connect to the backend outside the component so it doesn't reconnect on every render
const socket = io(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000",
);
// const socket = io(import.meta.env.VITE_API_rocess.env.VITE_API_BASE_URL ||'http://localhost:8000');

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "Helsinki",
      text: "Hi! I am the Engineer on Click assistant Helsinki. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the newest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  // Set up Socket listeners when the component mounts
  useEffect(() => {
    // Listen for replies from the backend
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, { sender: "Helsinki", text: data.text }]);
      setIsTyping(false);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message to UI
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setIsTyping(true);

    // Fire it through the WebSocket to Node.js
    socket.emit("sendMessage", input);

    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col mb-4 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
            <span>Helsinki Your Support Assistant</span>
            {/* Optional close button inside header */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="text-left text-gray-500 text-xs mt-1 italic">
                Helsinki is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border text-black border-gray-300 p-2 rounded-l-md focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Type your question..."
            />
            <button
              onClick={sendMessage}
              disabled={isTyping}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl absolute right-0 bottom-0"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default Chatbot;

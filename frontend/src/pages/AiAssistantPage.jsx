import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  RotateCcw,
  Copy,
  CheckCheck,
  Info,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import aiService from "../services/aiService";
import LoadingSpinner from "../components/LoadingSpinner";

const SUGGESTIONS = [
  "Summarise this repository.",
  "Which module changed the most?",
  "Who is the most active contributor?",
  "Describe the engineering trends in this project.",
  "What types of changes are most common?",
  "Is the repository growing or stabilising?",
  "Which files are modified most frequently?",
  "What engineering activities dominate this project?",
];

const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          ${
            isUser
              ? "bg-primary-600 text-white"
              : "bg-gradient-to-br from-purple-600 to-primary-600 text-white"
          }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={`max-w-[80%] relative ${isUser ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${
              isUser
                ? "bg-primary-600 text-white rounded-tr-sm"
                : "bg-dark-800 border border-dark-700 text-dark-200 rounded-tl-sm"
            }`}
        >
          {message.content}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1.5 self-start flex items-center gap-1 text-xs text-dark-600
              hover:text-dark-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <CheckCheck className="h-3 w-3 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        )}

        <span
          className={`text-xs text-dark-600 mt-1
          ${isUser ? "self-end" : "self-start"}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

const AiAssistantPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [summary, setSummary] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const init = async () => {
      setInitialising(true);
      try {
        const res = await aiService.getSummary(id);
        const summaryText =
          res?.summary ||
          res?.response ||
          "Repository analysis complete. Ask me anything about this project.";
        setSummary(summaryText);
        setMessages([
          {
            role: "assistant",
            content: `Hello! I'm your AI Engineering Assistant.\n\n${summaryText}\n\nFeel free to ask me anything about this repository.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm your AI Engineering Assistant. I'm ready to answer questions about this repository based on the analysed engineering data.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setInitialising(false);
      }
    };
    init();
  }, [id]);

  const handleSend = async (questionOverride) => {
    const question = (questionOverride || input).trim();
    if (!question || loading) return;

    const userMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      const res = await aiService.askQuestion(id, question);
      const answer =
        res?.answer || res?.response || "I was unable to generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠ I encountered an issue: ${err.message || "Unknown error"}. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.error("AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `Conversation reset. ${summary ? `\n\n${summary}` : ""}\n\nHow can I help you?`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  if (initialising) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Initialising AI Assistant…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-950">
      <div className="flex-shrink-0 px-6 py-4 border-b border-dark-800 bg-dark-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-primary-600 rounded-xl">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                AI Engineering Assistant
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </h1>
              <p className="text-xs text-dark-500">
                Powered by repository analytics · {messages.length - 1}{" "}
                exchanges
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn-ghost text-sm"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 bg-primary-950/40 border-b border-primary-500/15 px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-primary-400">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          The AI Assistant answers based on repository analytics and engineering
          knowledge — not raw Git data.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br
                from-purple-600 to-primary-600 flex items-center justify-center"
              >
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-dark-800 border border-dark-700 px-5 py-4 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 bg-dark-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 bg-dark-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 bg-dark-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length <= 1 && !loading && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-dark-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-dark-800 border
                    border-dark-700 text-dark-300 hover:border-primary-500/50
                    hover:text-primary-300 transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-4 py-4 border-t border-dark-800 bg-dark-900/50 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about commits, contributors, modules, trends…"
                rows={1}
                disabled={loading}
                className="input resize-none py-3 pr-4 leading-relaxed min-h-[48px]
                  max-h-32 overflow-y-auto"
                style={{ height: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-primary h-12 px-5 flex-shrink-0 rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-dark-600 mt-2 text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-dark-400 font-mono">
              Enter
            </kbd>{" "}
            to send ·
            <kbd className="ml-1 px-1.5 py-0.5 bg-dark-700 rounded text-dark-400 font-mono">
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;

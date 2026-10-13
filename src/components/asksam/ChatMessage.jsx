import ReactMarkdown from "react-markdown";
import SamLogo from "@/components/SamLogo";
import SamReadAloudButton from "@/components/sam/SamReadAloudButton";
import ToolPanel from "@/components/asksam/ToolPanel";
import { toolByPath } from "@/lib/askSamTools";

// One message in the Ask Sam chat. User messages are green bubbles on the
// right; Sam answers like ChatGPT, avatar left, and can open a tool inline.
export default function ChatMessage({ msg, onToolClose }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    );
  }

  const tool = msg.tool_path ? toolByPath(msg.tool_path) : null;

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <SamLogo className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 dark:[&_strong]:text-white [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1">
          {msg.content}
        </ReactMarkdown>
        <SamReadAloudButton text={msg.content} />
        {tool && <ToolPanel tool={tool} onClose={onToolClose} />}
      </div>
    </div>
  );
}
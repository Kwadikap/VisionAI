import { MessageInputForm } from '@/components/chat-ui/MessageInputForm';
import { MessageList } from '@/components/chat-ui/MessageList';

export function ChatUI() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden px-4 py-4">
      <div className="relative flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        <div className="flex-1 overflow-hidden pb-20">
          <MessageList />
        </div>
        <div className="absolute bottom-3 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="px-4 py-3">
            <MessageInputForm />
          </div>
        </div>
      </div>
    </div>
  );
}

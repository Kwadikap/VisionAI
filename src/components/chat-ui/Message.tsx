import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';

interface MessageProps {
  message: string;
  isUser: boolean;
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
    {children}
  </div>
);

export function Message({ message, isUser }: MessageProps) {
  return (
    <div
      className={cn(
        'flex max-w-full items-end gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <IconWrapper>
          <Bot className="h-5 w-5" />
        </IconWrapper>
      )}
      <div
        className={cn(
          'overflow-wrap-anywhere max-w-[80%] break-words rounded-2xl px-4 py-2 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                className="underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            code: (props) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { inline, className, children, ...rest } = props as any;
              return inline ? (
                <code
                  className={cn('rounded bg-black/10 px-1 py-0.5', className)}
                  {...rest}
                >
                  {children}
                </code>
              ) : (
                <pre className="text-wrap break-words rounded bg-black/80 p-3 text-xs text-white">
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </pre>
              );
            },
            ul: ({ className, ...props }) => (
              <ul
                className={cn('list-disc space-y-1 pl-5', className)}
                {...props}
              />
            ),
            ol: ({ className, ...props }) => (
              <ol
                className={cn('list-decimal space-y-1 pl-5', className)}
                {...props}
              />
            ),
            p: ({ className, ...props }) => (
              <p className={cn('whitespace-pre-wrap', className)} {...props} />
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
      {isUser && (
        <IconWrapper>
          <User className="2-5 h-5" />
        </IconWrapper>
      )}
    </div>
  );
}

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/ui/IconButton';

const InputSchema = z.object({ message: z.string().min(1) });

interface Props {
  onSubmit: (msg: string) => Promise<void>;
  disabled: boolean;
}

export function MessageInputForm({ onSubmit, disabled }: Props) {
  const form = useForm<z.infer<typeof InputSchema>>({
    resolver: zodResolver(InputSchema),
    defaultValues: { message: '' },
  });

  async function handleSubmit(data: z.infer<typeof InputSchema>) {
    const msg = data.message.trim();
    if (!msg || disabled) return;
    await onSubmit(msg);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full items-center gap-2"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  rows={1}
                  placeholder={
                    disabled ? 'Connecting...' : "What's on your mind..."
                  }
                  disabled={disabled}
                  className="no-scrollbar max-h-[120px] min-h-[40px] resize-none rounded-2xl disabled:opacity-60"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(handleSubmit)();
                    }
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <IconButton
          type="submit"
          aria-label="Send text message"
          variant={disabled ? 'secondary' : 'default'}
          disabled={disabled}
          icon={<PaperAirplaneIcon className="h-5 w-5" />}
        />
      </form>
    </Form>
  );
}

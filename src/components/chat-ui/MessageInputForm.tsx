import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/ui/IconButton';
import { useSSEvents } from '@/hooks/useSSEvents';

const InputSchema = z.object({
  message: z.string().min(1),
});

export function MessageInputForm() {
  const [sessionId] = useState<string>(crypto.randomUUID());
  const [initialMessage, setInitialMessage] = useState<boolean>(true);
  const [startConnection, setStartConnection] = useState<boolean>(false);

  const { sendMessage, connectionOpen } = useSSEvents({
    sessionId,
    startConnection,
  });

  const form = useForm<z.infer<typeof InputSchema>>({
    resolver: zodResolver(InputSchema),
    defaultValues: { message: '' },
  });

  function onSubmit(data: z.infer<typeof InputSchema>) {
    if (initialMessage) {
      setStartConnection(true);
      setInitialMessage(false);
    }
    sendMessage(data.message);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                  placeholder="What's on your mind..."
                  className="no-scrollbar max-h-[120px] min-h-[40px] resize-none rounded-2xl"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
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
          variant={connectionOpen.current ? 'default' : 'secondary'}
          icon={<PaperAirplaneIcon className="h-5 w-5" />}
        />
      </form>
    </Form>
  );
}

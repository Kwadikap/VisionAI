import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PaperAirplaneIcon,
  // MicrophoneIcon,
  // StopIcon,
} from '@heroicons/react/24/outline';

// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useChatContext } from '@/context/ChatContext';
// import { MessageType, type Message } from './types';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/ui/IconButton';
import { useSSEvents } from '@/hooks/useSSEvents';

const InputSchema = z.object({
  message: z.string().min(1),
});

export function MessageInputForm() {
  const [sessionId] = useState<string>(crypto.randomUUID());

  // const {
  //   connectWebsocket,
  //   sendMessage,
  //   socketOpen,
  //   is_audio,
  //   reconnectWithNewMode,
  //   disconnect,
  // } = useWebSocket({
  //   sessionId,
  //   addMessage,
  // });

  const { sendMessage, connectionOpen } = useSSEvents({
    sessionId,
  });

  const form = useForm<z.infer<typeof InputSchema>>({
    resolver: zodResolver(InputSchema),
    defaultValues: { message: '' },
  });

  // function isStreamingAudio() {
  //   return socketOpen && is_audio;
  // }

  // Connect for text mode (is_audio=false)
  // function startTextConversation() {
  //   if (!socketOpen || is_audio) {
  //     reconnectWithNewMode(false);
  //     setTimeout(() => connectWebsocket(), 150);
  //   }
  // }

  // Connect for audio mode (is_audio=true)
  // function startAudioConversation() {
  //   addMessage({
  //     id: crypto.randomUUID(),
  //     isUser: true,
  //     data: 'Speaking...',
  //     type: MessageType.text,
  //   });

  //   if (!socketOpen || !is_audio) {
  //     reconnectWithNewMode(true);
  //   }
  // }

  // function onSubmit(data: z.infer<typeof InputSchema>) {
  //   // Start text mode if not connected
  //   if (!socketOpen) {
  //     startTextConversation();
  //     // Wait for connection before sending
  //     setTimeout(() => {
  //       const msg: Message = {
  //         id: crypto.randomUUID(),
  //         isUser: true,
  //         data: data.message,
  //         type: MessageType.text,
  //       };
  //       addMessage(msg);
  //       sendMessage({ type: MessageType.text, data: data.message });
  //       form.reset();
  //     }, 500);
  //     return;
  //   }

  //   // Send immediately if already connected
  //   const msg: Message = {
  //     id: crypto.randomUUID(),
  //     isUser: true,
  //     data: data.message,
  //     type: MessageType.text,
  //   };
  //   addMessage(msg);
  //   sendMessage({ type: MessageType.text, data: data.message });
  //   form.reset();
  // }

  function onSubmit(data: z.infer<typeof InputSchema>) {
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
          // variant={'secondary'}
          disabled={!connectionOpen.current}
          icon={<PaperAirplaneIcon className="h-5 w-5" />}
        />

        {/* <IconButton
          type="button"
          aria-label="Start audio conversation"
          variant={isStreamingAudio() ? 'destructive' : 'secondary'}
          onClick={isStreamingAudio() ? disconnect : startAudioConversation}
          icon={
            isStreamingAudio() ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )
          }
        /> */}
      </form>
    </Form>
  );
}

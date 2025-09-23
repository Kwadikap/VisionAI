import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFeedback } from '@/hooks/useFeedback';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  feedback: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function FeedbackForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { feedback: '' },
  });

  const { sendFeedback } = useFeedback();

  function onSubmit(data: FormData) {
    if (!data.feedback) return;
    const feedbackData = {
      feedback: data.feedback,
    };
    sendFeedback.mutate(feedbackData, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <div className="grid h-full w-full place-items-center p-4">
      <Card className="min-h-[60vh] w-full gap-2 sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>Please enter your feedback below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-full items-center gap-2"
              id="feedback-form"
            >
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>What could be improved?</Label>
                    <FormControl>
                      <Textarea
                        disabled={sendFeedback.isPending}
                        rows={10}
                        className="no-scrollbar max-h-[500px] min-h-[40px] resize-none rounded-2xl"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height =
                            Math.min(target.scrollHeight, 240) + 'px';
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
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2 pt-2">
          <Button
            type="submit"
            form="feedback-form"
            className="w-full"
            disabled={sendFeedback.isPending}
          >
            {sendFeedback.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Submit feedback'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

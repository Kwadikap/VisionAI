import { visionApi } from '@/shared/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FeedbackData {
  feedback: string;
}

export function useFeedback() {
  const navigate = useNavigate();
  const sendFeedback = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const result = await visionApi.post(`/feedback/send`, data);
      return result;
    },
    onSuccess: () => {
      toast.success('Feedback sent!', {
        description: 'Thank you for helping us improve!',
      });
      navigate('/');
    },
    onError: (err) => {
      toast.error('Failed to submit feedback', {
        description: `Error: ${err.message}`,
      });
    },
  });

  return {
    sendFeedback,
  };
}

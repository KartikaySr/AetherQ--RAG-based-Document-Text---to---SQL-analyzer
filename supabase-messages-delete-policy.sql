-- Run on Supabase SQL editor so the app can replace messages when syncing a conversation.
-- Default conversations schema only defined SELECT/INSERT on messages.

DROP POLICY IF EXISTS messages_delete ON public.messages;

CREATE POLICY messages_delete ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

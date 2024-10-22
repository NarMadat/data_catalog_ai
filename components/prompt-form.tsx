import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { IconArrowElbow } from '@/components/ui/icons';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import Search from '@/components/Search';

interface PromptFormProps {
  input: string;
  setInput: (value: string) => void;
  setVariants: (variants: any[]) => void;
  setShowResults: (show: boolean) => void;
  setShowLoading: (show: boolean) => void;
  setValue: (value: number) => void;
}

export function PromptForm({
  input,
  setInput,
  setVariants,
  setShowResults,
  setShowLoading,
  setValue
}: PromptFormProps) {
  const inputRef = React.useRef(null);
  const { formRef, onKeyDown } = useEnterSubmit();

  
  const [showPromptForm, setShowPromptForm] = React.useState(false);

  const handleSendMessage = async (value: string) => {
    try {
      setValue(0);
      setShowLoading(true);

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Safe-Identifier': 'DocusDialogues'
        },
        body: JSON.stringify({ threadId: null, message: value })
      });

      const aiAnswer = await response.json();
      const jsonArray = Object.values(aiAnswer);
      setShowLoading(false);
      setShowResults(true);
      setVariants(jsonArray);
    } catch (error) {
      console.log(error);
      setShowLoading(false);
    }
  };

  
  const handleNotFound = (notFound: boolean) => {
    setShowPromptForm(notFound);
  };

  return (
    <div className="w-full space-y-4 p-4">
      
      <Search onNotFound={handleNotFound} />

      
      {showPromptForm && (
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault();
            const value = input.trim();
            setInput('');
            if (!value) return;
            await handleSendMessage(value);
          }}
          className="w-full"
        >
          <div className="relative flex items-center bg-transparent border border-gray-300 rounded-lg shadow-sm p-2">
            <Textarea
              ref={inputRef}
              placeholder="Փնտրել информацию..."
              className="min-h-[20px] w-full resize-none bg-transparent px-2 py-1 text-xs border-none focus:outline-none"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              name="message"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="flex items-center ml-2">
              <Button
                type="submit"
                size="sm"
                disabled={!input}
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center transition-colors hover:bg-blue-600"
              >
                <IconArrowElbow className="w-3 h-3" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
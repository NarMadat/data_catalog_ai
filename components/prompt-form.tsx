import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

export function PromptForm({
  input,
  setInput,
  setVariants,
  setShowResults,
  setShowLoading,
  setValue
}) {
  const inputRef = React.useRef(null)
  const { formRef, onKeyDown } = useEnterSubmit()

  const handleSendMessage = async (value) => {
    try {
      setValue(0)
      setShowLoading(true)

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Safe-Identifier': 'DocusDialogues'
        },
        body: JSON.stringify({ threadId: null, message: value })
      })

      const aiAnswer = await response.json()
      const jsonArray = Object.values(aiAnswer)
      setShowLoading(false)
      setShowResults(true)
      setVariants(jsonArray)
    } catch (error) {
      console.log(error)
      setShowLoading(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault()
        const value = input.trim()
        setInput('')
        if (!value) return
        await handleSendMessage(value)
      }}
      className="w-full"
    >
      <div className="relative flex max-h-20 w-full items-center px-1 bg-transparent">
        <Textarea
          ref={inputRef}
          placeholder="Փնտրել տեղեկատվություն․․"
          className="min-h-[20px] w-full resize-none bg-transparent px-2 py-0.25 text-xs border-none focus:outline-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          name="message"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 flex items-center">
          <Button
            type="submit"
            size="small"
            disabled={!input}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
          >
            <IconArrowElbow className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

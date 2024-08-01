'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'

import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

export function PromptForm({
  input,
  setInput,
  setVariants,
  setShowResults,
  setShowLoading,
  setValue
}: {
  input: string
  setInput: (value: string) => void
  setVariants: (value: any[]) => void
  setShowResults: (value: boolean) => void
  setShowLoading: (value: boolean) => void
  setValue: (value: number) => void
}) {
  // const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = async (value: string) => {
    try {
      setValue(0)
      setShowLoading(true)
      console.log('sadasd')
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Safe-Identifier': 'DocusDialogues'
        },
        body: JSON.stringify({
          threadId: null,
          message: value
        })
      })

      const aiAnswer = await response.json()
      const jsonArray = Object.keys(aiAnswer).map(key => aiAnswer[key])
      setShowLoading(false)
      setShowResults(true)
      setVariants(jsonArray)
      setShowResults(true)
      console.log(aiAnswer)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form
      onSubmit={async (e: any) => {
        e.preventDefault()

        const value = input.trim()
        setInput('')
        if (!value) return

        const responseMessage = await handleSendMessage(value)
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-2 sm:rounded-md sm:border sm:px-2">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          placeholder="Փնտրել տեղեկատվություն․․"
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Button type="submit" size="icon" disabled={input === ''}>
            <IconArrowElbow />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

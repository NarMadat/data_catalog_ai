import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  setVariants: (value: any[]) => void
  setShowResults: (value: boolean) => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
                            setVariants,
                            setShowResults
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()


  return (
    <div className=" inset-x-0 mt-4 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">


      <div className="mx-auto sm:max-w-2xl sm:px-4">


      </div>
    </div>
  )
}

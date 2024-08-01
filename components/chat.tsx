'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { DataTree } from '@/components/tree/tree'
import * as React from 'react'
import { PromptForm } from '@/components/prompt-form'
import { FooterText } from '@/components/footer'
import AnimatedCircularProgressBar from '@/components/ProgressMagic'
import { RingLoader } from 'react-spinners'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

interface ResultButtonProps {
  dataProviderUnit: string
  dataType: string
  dataName: string
  onClick: (dataName: string) => void
}

const ResultButton: React.FC<ResultButtonProps> = ({
  dataProviderUnit,
  dataType,
  dataName,
  onClick
}) => {
  return (
    <button
      onClick={() => onClick(dataName)}
      className={'bg-amber-300 text-black p-2 rounded mb-2 text-xs mr-4'}
    >
      {dataType} {'->'} {dataName}
    </button>
  )
}

interface ResultsContainerProps {
  json: Array<{
    data_provider_unit: string
    data_type: string
    data_name: string
  }>
  showResults: boolean
  onButtonClick: (dataName: string) => void
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  json,
  showResults,
  onButtonClick
}) => {
  return (
    <div id="resultsContainer" className={'p-4'}>
      <h2 className={'mt-12'}>Ընտրել տարբերակներից:</h2>

      {json.map(item => (
        <ResultButton
          key={item.data_name}
          dataProviderUnit={item.data_provider_unit}
          dataType={item.data_type}
          dataName={item.data_name}
          onClick={onButtonClick}
        />
      ))}
    </div>
  )
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const [input, setInput] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [variants, setVariants] = useState<any[]>([])

  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('')
  const [value, setValue] = useState(0)

  useEffect(() => {
    const handleIncrement = (prev: number) => {
      if (prev === 96) {
        return 96
      }
      return prev + 3
    }
    setValue(handleIncrement)
    const interval = setInterval(() => setValue(handleIncrement), 2000)
    return () => clearInterval(interval)
  }, [])
  const handleButtonClick = (dataName: string) => {
    setGlobalSearchTerm(dataName)
    console.log('Button clicked:', dataName)
    searchAiTerm(dataName)
  }

  const searchAiTerm = (term: string) => {
    // Your custom function here
    setSearchTerm(term)
    console.log('Searching for:', term)
  }

  return (
    <div className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
      <div className=" inset-x-0 mt-4 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
        <div className="mx-auto sm:max-w-2xl sm:px-4">
          <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
            <PromptForm
              input={input}
              setInput={setInput}
              setVariants={setVariants}
              setShowResults={setShowResults}
              setShowLoading={setShowLoading}
              setValue={setValue}
            />
            <FooterText className="hidden sm:block" />
          </div>
        </div>

        <div className={'container mt-4'}>
          {variants && showResults && !showLoading && (
            <ResultsContainer
              json={variants}
              showResults={true}
              onButtonClick={handleButtonClick}
            />
          )}

          {showLoading && (
            <div className={'flex justify-center pt-8'}>
              <RingLoader size={60} color={'green'} />
            </div>
          )}
        </div>
      </div>

      <DataTree searchTerm={searchTerm} />
    </div>
  )
}

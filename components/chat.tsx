'use client'
import { useEffect, useState } from 'react'
import { DataTree } from '@/components/tree/tree'
import * as React from 'react'
import { PromptForm } from '@/components/prompt-form'
import { FooterText } from '@/components/footer'
import AnimatedCircularProgressBar from '@/components/ProgressMagic'
import { RingLoader } from 'react-spinners'
import ResultsContainer from '@/components/assistant/ResultsContainer'
import { Col, Row, Segmented } from 'antd'

const progressTexts = [
  'Որոնման մեկնարկ...',
  'Տվյալների հավաքագրում...',
  'Տվյալների մշակում...',
  'Տվյալների համեմատություն...',
  'Լավագույն համընկնումների ընտրություն...',
  'Տվյալների վերլուծություն...',
  'Հաշվետվության պատրաստում...',
  'Վերջնական արդյունքների ապահովում...',
  'Արդյունքների ներկայացում...',
  'Օգտագործողի տեղեկացում...',
  'Արդյունքների ստուգում...',
  'Որոնումը ավարտված է:'
]

export function Chat() {
  const [input, setInput] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [variants, setVariants] = useState<any[]>([])

  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('')
  const [value, setValue] = useState(0)
  const [selectedView, setSelectedView] = useState<string | number>(
    'Ծառի տեսքով'
  )
  const [textDisabled, setTextDisabled] = useState<boolean>(true)
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
    setTextDisabled(false)
    searchAiTerm(dataName)
  }

  const searchAiTerm = (term: string) => {
    setSearchTerm(term)
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

        <div className={'container '}>
          <Row justify={'center'} className={'py-4'}>
            <Col>
              {showLoading && (
                <Row gutter={[12, 12]}>
                  <Col xs={24} className={'flex justify-center'}>
                    <AnimatedCircularProgressBar
                      max={100}
                      value={value}
                      min={0}
                      gaugePrimaryColor={'#036300'}
                      gaugeSecondaryColor={'#9dac94'}
                    />
                  </Col>
                  <Col xs={24} className={'text-center'}>
                    <p>{progressTexts[Math.floor(value / 8)]}</p>
                  </Col>
                </Row>
              )}
            </Col>
            <Col>
              {showLoading && (
                <div className={'flex justify-center pt-8'}></div>
              )}
            </Col>
            <Col xs={24}>
              {variants && showResults && !showLoading && (
                <ResultsContainer
                  json={variants}
                  showResults={true}
                  onButtonClick={handleButtonClick}
                  full={false}
                />
              )}
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col xs={24}>
              <Segmented
                value={selectedView}
                onChange={setSelectedView}
                options={[
                  {
                    label: 'Ծառի տեսքով',
                    value: 'Ծառի տեսքով',
                    disabled: false
                  },
                  {
                    label: 'Տեքստային',
                    value: 'Տեքստային',
                    disabled: textDisabled
                  }
                ]}
                size={'large'}
                block
              />
            </Col>
            <Col xs={24}>
              {selectedView === 'Ծառի տեսքով' ? (
                <DataTree searchTerm={searchTerm} />
              ) : selectedView === 'Տեքստային' ? (
                <ResultsContainer
                  json={variants}
                  showResults={true}
                  onButtonClick={handleButtonClick}
                  full={true}
                />
              ) : (
                <RingLoader size={60} color={'green'} />
              )}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

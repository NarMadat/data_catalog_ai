import { AssistantResponse } from 'ai'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(req: NextRequest) {
  // Parse the request body

  try {
    console.time('aiExecutionTime')
    const input: {
      threadId: string | null
      message: string
    } = await req.json()

    // Create a thread if needed
    const threadId = input.threadId ?? (await openai.beta.threads.create({})).id

    // Add a message to the thread
    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: input.message
    })

    const instructions =
      'You are a top level search engine for armenian keywords. Your purpose is to assist user to find needed data in government unstructured database.' +
      'You must find 10  best  meaningfully matches for input keywords.' +
      'You need to search for words from the database by context, also identifying and correcting any typos in words,' +
      'and returning the correct versions. You must provide 5-7 best matches  that are contextually closest to the searchable word.' +
      'If nothing relevant was found, answer with emoty json.' +
      'Answer with only exact JSON blob, with keys name, column . Example:' +
      '[ {“id”:45,“data_provider”:”ՀՀ Էկոնոմիկայի նախարարություն“,“data_provider_unit”:”Մտավոր սեփականության գրասենյակ“,“system”:”Մտավոր սեփականության գրասենյակ“, “data_type”:”Գյուտ“,“data_name”=”ռեֆերատի բովանդակություն“} ,' +
      '{“id”:8591,“data_provider”:”Պետական եկամուտների կոմիտե“,“data_provider_unit”:”Տեղեկատվական համակարգերի վարչություն“,“system”:”Դիմում` սոցիալական վճար կատարելը վերսկսելու“, “data_type”:”Նույնականացում“,“data_name”=”Հարկ վճարողի հաշվառման համար“}, ... ]' +
      `User new input is: ${input.message}`

    const runStream = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id:
        process.env.ASSISTANT_ID ??
        (() => {
          throw new Error('ASSISTANT_ID is not set')
        })(),
      instructions: instructions
    })

    if (runStream.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        runStream.thread_id
      )
      if (messages && messages.data[0].content[0].type == 'text') {
        const jsonStringWithBrackets = messages.data[0].content[0].text.value

        const hasBackticks =
          jsonStringWithBrackets.startsWith('```') &&
          jsonStringWithBrackets.endsWith('```')

        const jsonString = hasBackticks
          ? jsonStringWithBrackets.replace(/^```json|```$/g, '')
          : jsonStringWithBrackets

        const fullAnswer = JSON.parse(jsonString)

        console.log('fullAnswer')
        console.log(fullAnswer)

        console.timeEnd('aiExecutionTime')
        return NextResponse.json({ ...fullAnswer })
      }
    }
  } catch (error: any) {
    const { status, data } = error

    return NextResponse.json({ ...data }, { status: status })
  }
}

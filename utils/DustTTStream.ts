import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export async function DustTTStream(prompt: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch('https://dust.tt/api/v1/apps/kant01ne/984906ca63/runs', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${process.env.DUST_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        'specification_hash': 'ea7178118548f25beb15b3b19d65d1c717a7a2c2baf02a4d4258cd4b1a7c60df',
        'config': {
            'MODEL': {
                'provider_id': 'openai',
                'model_id': 'text-davinci-003',
                'use_cache': true
            }
        },
        "stream": true,
        'inputs': [
            {
                'question': prompt
            }
        ]
    })
  })

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://docs.dust.tt/runs
          
          try {
            const json = JSON.parse(data);
            if (json.type === "final") {
              controller.close();
              return;
            }

            if (json.type === 'block_execution' && json.content.block_type === 'code' && json.content.block_name === 'FINAL') {
              console.log(json.content.execution?.[0]?.[0]?.value?.answer)
              const queue = encoder.encode(json.content.execution?.[0]?.[0]?.value?.answer);
              controller.enqueue(queue);
            }
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from Dust may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
const form = document.querySelector('form');
const resultsContainer = document.querySelector('#results');

form.addEventListener('submit', async (e) => {
    try {
        e.preventDefault();
        const {
            prompt: { value: promptValue },
            stream: { checked: streamValue },
        } = form.elements;

        if (!promptValue) return alert('Please enter a prompt');
        resultsContainer.innerHTML = '';

        const response = await fetch(
            'http://localhost:5050/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    provider: 'open-ai',
                    mode: 'development',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    stream: streamValue,
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a software developer student that only speaks in rhymes',
                        },
                        {
                            role: 'user',
                            content: promptValue,
                        },
                    ],
                }),
            }
        );
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error);
        }
        if (streamValue) {
            //handle the stream
            // console.log('response: ', response);
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let dataResult = '';
            // console.log('reader: ', reader);

            let isDone = false;
            while (!isDone) {
                const result = await reader.read();
                if (result.done) {
                    isDone = true;
                    break;
                }
                // console.log('result: ', result);
                const chunk = decoder.decode(result.value, { stream: true });
                // console.log('chunk: ', chunk);
                const lines = chunk.split('\n');
                // console.log('lines: ', lines);
                lines.forEach((line) => {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data:', '');
                        const data = JSON.parse(jsonStr);
                        // console.log('data: ', data);
                        const content = data.choices[0]?.delta?.content;

                        // console.log('content: ', content);
                        if (content) {
                            dataResult += content;
                            console.log('dataResult: ', dataResult);
                        }
                    }
                });
            }
        } else {
            const data = await response.json();
            // console.log('data: ', data);
            resultsContainer.innerHTML = data.message?.content;
        }
    } catch (error) {
        console.error(error);
    }
});

const form = document.querySelector("form"); //selector for form
const resultsContainer = document.querySelector("#results"); //selector for container results

//event submit for form
form.addEventListener("submit", async (e) => {
  try {
    // prevent form for submit
    e.preventDefault();
    //destructing form elements
    const {
      prompt: { value: promptValue },
      stream: { checked: streamValue },
    } = form.elements;

    //do not accept empty prompt
    if (!promptValue) return alert("Please enter a prompt");
    //set div value empty
    resultsContainer.innerHTML = "";

    //fetch with header
    //POST
    // 'Content-type': 'application/json'
    // provider: 'open-ai',
    // mode: 'development',
    // body JSON.stringify
    //model gpt4o
    //stream

    const response = await fetch(
      "http://localhost:5050/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          provider: "open-ai",
          mode: "development",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          stream: streamValue,
          messages: [
            {
              role: "system",
              content:
                "You are a software developer student that only speaks in rhymes",
            },
            {
              role: "user",
              content: promptValue,
            },
          ],
        }),
      }
    );
    // if response is not ok
    if (!response.ok) {
      const { error } = await response.json(); //destructing the error
      throw new Error(error); //throw new Error
    }
    // streamValue is not empty
    if (streamValue) {
      //handle the stream
      // console.log('response: ', response);
      const reader = response.body.getReader(); // read the body
      const decoder = new TextDecoder("utf-8"); // decode into utf-8
      let dataResult = ""; //set empty
      // console.log('reader: ', reader);

      let isDone = false;
      while (!isDone) {
        // is the reader finishing to read
        const result = await reader.read();
        // check if is done to read and break
        if (result.done) {
          isDone = true;
          break;
        }
        //decode chunk
        // console.log('result: ', result);
        const chunk = decoder.decode(result.value, { stream: true });
        //break the new lines
        // console.log('chunk: ', chunk);
        const lines = chunk.split("\n");
        //go each line
        // console.log('lines: ', lines);
        lines.forEach((line) => {
          //if starts with data
          if (line.startsWith("data: ")) {
            // replace data with empty string
            const jsonStr = line.replace("data:", "");
            //pass to JSON
            const data = JSON.parse(jsonStr);
            // console.log('data: ', data);
            //take content if exist
            const content = data.choices[0]?.delta?.content;

            //if some content exist
            // console.log('content: ', content);
            if (content) {
              // add content to data result
              dataResult += content;
              //console the data result
              console.log("dataResult: ", dataResult);
            }
          }
        });
      }
    } else {
      // await  response json
      const data = await response.json();
      //console data
      // console.log('data: ', data);
      //if there exist a message
      resultsContainer.innerHTML = data.message?.content;
    }
    //error
  } catch (error) {
    //console error
    console.error(error);
  }
});

import Groq from "groq-sdk";
async function main() {
  const keys = await chrome.storage.sync.get(["api_key"]);
  if (!keys.api_key) {
    console.error("API key not found");
  }
  const { api_key } = keys;
  const groq = new Groq({ apiKey: api_key, dangerouslyAllowBrowser: true });

  const dataDiv = document.querySelector("#main-content > div");
  const props = JSON.parse(dataDiv.dataset["reactProps"]);
  const urls = props.pages.map((page) => page.url);
  if (
    urls.find((u) => {
      return u.includes("missing_placeholder");
    }) != undefined
  ) {
    alert("no pages found, cannot vibe grade");
    return;
  }

  let questions_dict = {};
  const multiple_questions = props.question == undefined;
  if (multiple_questions) {
    for (let i = 0; i < props.questions.length; i++) {
      const question = props.questions[i];
      const q = {
        id: question.id,
        weight: question.weight,
        type: question.type,
        title: question.title,
        scoring_type: question.scoring_type,
        anchor: question.anchor,
        rubric: [],
      };
      questions_dict[question.id] = q;
    }
  } else {
    questions_dict["question"] = {
      id: props.question.id,
      weight: props.question.weight,
      type: props.question.type,
      title: props.question.title,
      scoring_type: props.question.scoring_type,
      anchor: props.question.anchor,
      rubric: [],
    };
  }

  for (let i = 0; i < props.rubric_items.length; i++) {
    const rubric_item = props.rubric_items[i];
    let q_id = multiple_questions ? rubric_item.question_id : "question";
    questions_dict[q_id].rubric.push({
      description: rubric_item.description,
      weight: rubric_item.weight,
    });
  }
  let questions = Object.values(questions_dict);

  let messages = [
    {
      role: "system",
      content: `Make sure to respond using the following json format for all reponses: {
        "feedback": "", // this is a html string of all feedback for the grader, including reasoning for the entire grading process
        "grade": "", // the student's grade that they recieve
      }`,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Please grade as throughly as possible for the attached images using the following questions and rubric: ${JSON.stringify(
            questions,
          )}`,
        },
        ...urls.map((url) => ({
          type: "image_url",
          image_url: {
            url: url,
          },
        })),
      ],
    },
  ];

  let completion = await groq.chat.completions.create({
    messages: messages,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    response_format: {
      type: "json_object",
    },
  });
  let response = JSON.parse(completion.choices[0].message.content);
  console.log(response);

  const newDiv = document.createElement("div");
  newDiv.innerHTML = `
  <div id="feedbackbox" style="
    z-index: 99999999;
    top: 10px;
    left: 10px;
    position: fixed;
    width: 40vw;
    max-height: 80vh;
    background: rgba(24, 71, 46, 0.8);
    color: white;
    overflow: auto;
    padding: 1em;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    font-family: sans-serif;
    font-size: 0.9em;
  ">
    <button id="xbutton" style="
      position: absolute;
      top: 5px;
      right: 10px;
      background: transparent;
      border: none;
      font-size: 1.2em;
      font-weight: bold;
      cursor: pointer;
      color: #333;
    ">&times;</button>
    <h1 style="margin-top: 0;">AI Suggestion</h1>
    <h3>Suggested Grade: ${response.grade}</h3>
    <pre style="white-space: pre-wrap;">${response.feedback}</pre>
  </div>
`;
  document.querySelector("body").appendChild(newDiv);

  document.getElementById("xbutton").addEventListener("click", () => {
    const box = document.getElementById("feedbackbox");
    if (box) box.remove();
  });
}

const vibeGradingButton = document.createElement("button");
vibeGradingButton.innerText = "Vibe Grade!";
vibeGradingButton.style.position = "fixed";
vibeGradingButton.style.top = "80px";
vibeGradingButton.style.left = "80px";
vibeGradingButton.style.padding = "10px 20px";
vibeGradingButton.style.fontSize = "16px";
vibeGradingButton.style.backgroundColor = "#18472ECC";
vibeGradingButton.style.color = "white";
vibeGradingButton.style.border = "none";
vibeGradingButton.style.borderRadius = "5px";
vibeGradingButton.style.cursor = "pointer";
vibeGradingButton.style.zIndex = "9999";
vibeGradingButton.style.fontFamily = "sans-serif";
vibeGradingButton.style.fontWeight = "bold";

vibeGradingButton.addEventListener("click", () => {
  main();
});

document.querySelector("body").appendChild(vibeGradingButton);

if (new URL(window.location.href).pathname.endsWith("/grade")) {
}
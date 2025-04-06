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
      role: "user",
      content: [
        {
          type: "text",
          text: `Please grade the attached images using the following questions and rubric: ${JSON.stringify(
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
  });

  console.log(completion.choices[0].message.content);

  const newDiv = document.createElement("div");
  newDiv.innerHTML = `<div style="z-index: 99999999; top: 0; left: 0; position: fixed; width: 50vw; background: white; overflow: scroll;">
		<h1>AI Suggestion</h1>
	<pre style="text-wrap-mode: wrap;">${completion.choices[0].message.content}</pre>

	</div>`;
  document.querySelector("body").appendChild(newDiv);
}

if (window.location.href.endsWith("/grade")) {
  main();
}

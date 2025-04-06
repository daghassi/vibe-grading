import Groq from "groq-sdk";
const keys = await chrome.storage.sync.get(["api_key"]);
if (!keys.api_key) {
  console.error("API key not found");
}
const { api_key } = keys;

let dataDiv = document.querySelector("#main-content > div");
let props = JSON.parse(dataDiv.dataset["reactProps"]);
let urls = props.pages.map((page) => page.url);

let questions_dict = {};
for (let i = 0; i < props.questions.length; i++) {
  let question = props.questions[i];
  let q = {
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

for (let i = 0; i < props.rubric_items.length; i++) {
  const rubric_item = props.rubric_items[i];
  questions_dict[rubric_item.question_id].rubric.push({
    description: rubric_item.description,
    weight: rubric_item.weight,
  });
}
let questions = Object.values(questions_dict);

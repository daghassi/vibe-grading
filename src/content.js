import Groq from "groq-sdk";
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

let completion = await groq.chat.completions.create({
	messages: [
		{
			role: "user",
			content:
				`Please grade the attached images using the following questions and rubric: ${
					JSON.stringify(questions)
				}`,
		},
		...(urls.map((url) => ({
			"type": "image_url",
			"image_url": {
				"url": url,
			},
		}))),
	],
	model: "meta-llama/llama-4-scout-17b-16e-instruct",
});

console.log(completion.choices[0].message.content);

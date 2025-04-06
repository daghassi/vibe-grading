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
      question_number: props.question.full_index,
      rubric: [],
    };
  }

  for (let i = 0; i < props.rubric_items.length; i++) {
    const rubric_item = props.rubric_items[i];
    let q_id = multiple_questions ? rubric_item.question_id : "question";
    questions_dict[q_id].rubric.push({
      id: rubric_item.position,
      description: rubric_item.description,
      weight: rubric_item.weight,
    });
  }
  let questions = Object.values(questions_dict);
  let page_num = new Number(
    document
      .querySelector("main img")
      .alt.replaceAll("Page ", "")
      .split("/")[0],
  );
  let url = urls[page_num - 1];

  let messages = [
    {
      role: "system",
      content: `Make sure to respond using the following json format for all reponses: {
        "feedback": "", // this is a html string of all feedback for the grader, including reasoning for the entire grading process
        "grade": "", // the student's grade that they recieve. make sure this is a number
        "rubric_id": "", // the id from the rubric number that best matches the assigned grade
        "rubric_description": "", // description from the rubric that best matches the assigned grade
      }`,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Please grade as throughly as possible for the attached image on question '${questions[0].question_number}' using the following questions and rubric: \n ${JSON.stringify(
            questions[0],
          )}`,
        },
        {
          type: "image_url",
          image_url: {
            url: url,
          },
        },
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
      color: white;
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

    vibeGradingButton.style.display = "block";
  });
}

const vibeGradingButton = document.createElement("button");
vibeGradingButton.innerHTML = `<svg width="64px" height="64px" viewBox="0 0 600 600" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(1.35856,0,0,1.30434,-97.7326,-107.729)">
        <ellipse cx="292.519" cy="302.532" rx="198.74" ry="207.001" style="fill:rgb(60,178,117);"/>
    </g>
    <g transform="matrix(1.35856,0,0,1.30434,-97.7326,-107.729)">
        <path d="M93.779,302.532C93.779,188.285 182.832,95.531 292.519,95.531C402.207,95.531 491.26,188.285 491.26,302.532L93.779,302.532Z" style="fill:rgb(243,183,37);"/>
    </g>
    <g id="Artboard1">
        <rect x="0" y="0" width="600" height="600" style="fill:none;"/>
        <g transform="matrix(0.905705,0,0,0.869561,34.7354,23.8057)">
            <ellipse cx="292.519" cy="302.532" rx="198.74" ry="207.001" style="fill:rgb(237,126,49);"/>
        </g>
        <g transform="matrix(1.17408,0,0,1.17408,-53.7295,-36.8285)">
            <g transform="matrix(1.25235,0,0,1.10059,-347.681,-184.074)">
                <ellipse cx="516.91" cy="299.437" rx="32.541" ry="45.207" style="fill:white;"/>
            </g>
            <g transform="matrix(1.039,0,0,1.039,-231.713,-154.407)">
                <path d="M490.419,349.698C495.807,349.571 503.805,357.114 510.6,357.063C517.395,357.012 531.134,348.849 532.601,348.796C542.718,348.428 561.339,357.239 572.123,365.247C584.899,374.733 589.707,385.154 593.247,401.167C596.202,414.533 600.807,431.624 604.367,442.267C607.021,450.2 610.81,458.418 615.42,464.795C619.888,470.974 626.111,476.301 632.027,480.528C637.777,484.636 646.305,488.575 650.917,490.153C653.113,490.904 657.552,490.872 659.701,489.997C663.516,488.444 671.469,480.224 675.632,480.667C679.795,481.111 684.855,487.856 684.681,492.657C684.506,497.457 679.543,505.91 674.588,509.469C669.633,513.028 662.362,513.934 655.653,513.914C648.092,513.891 637.437,512.618 629.228,509.33C620.131,505.688 608.784,499.406 600.497,492.56C592.21,485.715 586.39,479.528 579.635,466.832C569.601,447.972 568.155,424.463 565.742,426.012C563.329,427.562 561.869,451.925 560.676,465.138C560.195,470.462 559.43,475.864 560.073,481.162C560.811,487.243 562.804,495.545 565.104,501.625C566.869,506.293 567.011,513.81 581.96,513.968C593.93,514.093 623.728,514.656 635.962,516.3C649.252,518.086 663.5,518.76 665.368,543.306C666.909,563.565 655.27,583.656 570.928,586.289C539.264,587.277 468.225,588.561 475.933,583.464C477.321,582.545 555.979,537.288 560.97,531.745C565.961,526.202 524.635,548.25 505.879,550.207C484.124,552.478 438.836,533.289 430.423,532.978C422.009,532.667 446.099,544.425 455.398,548.342C466.962,553.212 499.593,560.765 499.593,560.765C499.593,560.765 488.158,581.102 429.021,583.725C405.741,584.757 360.291,576.324 360.154,550.457C360.079,536.405 354.731,520.786 393.144,515.034C409.223,512.626 436.874,516.846 450.556,512C463.915,507.268 465.352,488.847 466.689,472.346C467.868,457.791 458.766,424.769 458.766,424.769C458.766,424.769 448.012,469.007 433.598,483.728C419.184,498.449 401.789,509.876 372.284,513.096C360.157,514.419 344.622,512.356 341.427,493.421C340.612,488.593 343.587,482.022 350.416,481.805C357.259,481.587 363.661,491.498 371.146,490.735C379.339,489.899 391.679,483.796 399.572,476.79C414.099,463.897 421.259,445.619 424.997,430.487C428.202,417.509 430.433,401.188 435.192,390.32C439.344,380.839 443.185,372.236 453.552,365.278C461.486,359.954 465.273,358.871 470.982,356.459C477.126,353.862 484.698,349.832 490.419,349.698Z" style="fill:white;"/>
            </g>
        </g>
    </g>
</svg>
`;
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

if (new URL(window.location.href).pathname.endsWith("/grade")) {
  vibeGradingButton.addEventListener("click", () => {
    vibeGradingButton.innerHTML = `
      <svg class="spin-icon" width="32px" height="32px" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <circle cx="300" cy="300" r="280" stroke="white" stroke-width="40" fill="none" stroke-dasharray="80 100"/>
      </svg>
    `;
    
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spin-icon {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(styleTag);

    main();
  });

  document.body.appendChild(vibeGradingButton);
}
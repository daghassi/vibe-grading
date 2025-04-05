let dataDiv = document.querySelector("#main-content > div");
let props = JSON.parse(dataDiv.dataset['reactProps']);
let urls = props.pages.map(page => page.url);

console.log(urls);

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(["api_key", "harshness"], (data) => {
    if (!data.api_key) {
      console.log("No API key found");
    } else {
      document.getElementById("api-key").value = data.api_key;
      console.log("API key loaded:", data.api_key);
    }
  });
  document.querySelector("#save-settings").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key").value;
    const harshness = document.getElementById("harshness").value;
    chrome.storage.sync.set({ api_key: apiKey, harshness: harshness });
  });
});

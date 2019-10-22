document.getElementById('visit_help_link').addEventListener('click', function (e) {
  chrome.tabs.create({ url: "https://shimo.im/docs/H3rVCk3rjWd3KjKh/read" });
  window.close();
});
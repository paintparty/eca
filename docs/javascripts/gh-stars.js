// Fills the header star counter from the public GitHub API. The count is
// cached in localStorage for an hour to stay under the unauthenticated rate
// limit. On any failure the counter stays hidden and "Star" still links out.
(function () {
  var link = document.querySelector("[data-eca-stars]");
  if (!link) return;

  var repo = link.getAttribute("data-eca-stars");
  var count = link.querySelector("[data-eca-stars-count]");
  var key = "eca-stars:" + repo;
  var maxAgeMs = 60 * 60 * 1000;

  function format(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }

  function show(n) {
    count.textContent = format(n);
    count.hidden = false;
    link.title = "Star " + repo + " on GitHub (" + n.toLocaleString() + " stars)";
  }

  try {
    var cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.time < maxAgeMs) {
      show(cached.stars);
      return;
    }
  } catch (e) {}

  fetch("https://api.github.com/repos/" + repo)
    .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
    .then(function (data) {
      show(data.stargazers_count);
      try {
        localStorage.setItem(key, JSON.stringify({ stars: data.stargazers_count, time: Date.now() }));
      } catch (e) {}
    })
    .catch(function () {});
})();

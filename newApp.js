// Elements
const form = document.forms.newsControls;
const countryInput = form.elements.country;
const categoryInput = form.elements.category;
const searchInput = form.elements.search;
const newsContainer = document.querySelector(".news-container .row");

// Custom Http Module
// Тут создается объект с двумя методами запросов GET и POST
function customHttp() {
  return {
    get(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          resolve(xhr.responseText);
        });
        xhr.addEventListener('error', () => {
          reject();
        })
        xhr.send();
      });
    },
  };
}
// Init http module
const http = customHttp();
const p = http.get(
  `${"https://news-api-v2.herokuapp.com"}/top-headlines?country=${"ru"}&apiKey=${"e98beb24db01409080f7d9e708673611"}`
);
p.then((res) => {
  console.log(res);
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
  searchInput.value = "";
});

// в объектe newsServices содержатся 2 запроса к серверу
// методы принимают callback для того, чтоб передать их в запросы из http
const newsService = (function () {
  const apiKey = "e98beb24db01409080f7d9e708673611";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "ru", category = "everything") {
      http.get(
        `${apiUrl}/top-headlines?country=${country}${
          category === "everything" ? "" : "&category=" + category
        }&apiKey=${apiKey}`
      );
    },
    everything(query) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`);
    },
  };
})();

// load news function
function loadNews() {
  showLoader();
  const country = countryInput.value;
  const text = searchInput.value;
  const category = categoryInput.value;
  if (text) {
    newsService.everything(text).than((response) => {
      console.log(response);
    });
  } else {
    newsService.topHeadlines(country, category, onGetResponse);
  }
}

function onGetResponse(err, res) {
  removeLoader();
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  if (err) {
    showAlert(err, "toast-container");
    return;
  }

  if (!res.articles.length) {
    noNewsAlert();
    return;
  }
  renderNews(res.articles);
}

function renderNews(news) {
  let fragment = "";
  news.forEach((news) => {
    const item = templateNews(news);
    fragment += item;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

function templateNews({ title, description, url, urlToImage }) {
  return `
    <div class='col s12'>
      <div class='card'>
        <div class='card-image'>
          <img src=${
            urlToImage ||
            "https://unitedstatestaxservices.us/wp-content/uploads/2020/03/1-BREAKING-NEWS.png"
          }>
          <span class='card-title'>${title || ""}</span>
        </div>
        <div class='card-content'>
          <p>${description || ""}</p>
        </div>
        <div class='card-action'>
          <a href='${url}'>Read more</a>
        </div>
      </div>
    </div>
  `;
}
function showAlert(msg, type = "succes") {
  M.toast({ html: msg, classes: type });
}
function noNewsAlert() {
  clearContainer(newsContainer);
  let msg = `
  <div class='no-news-container col s12'>
    <p>Упс... Новостей по вашему запросу не найдено</p>
  </div>`;
  newsContainer.insertAdjacentHTML("afterbegin", msg);
}

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    child.remove();
    child = container.lastElementChild;
  }
}

function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>`
  );
}

function removeLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}

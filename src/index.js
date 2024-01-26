import "./styles";
import { TAP_NAME } from "./assets/TAB_NAME.js";
require("dotenv").config();

class Header {
  constructor(appElement) {
    //매개변수로 입력받음
    this.headerElement = this.createElement("header");
    this.headerElement.classList.add("header");

    const linkhuText = this.createElement("span", "LINKHU");
    linkhuText.classList.add("headerFont", "linkhuText");
    const newsText = this.createElement("span", " - NEWS");
    newsText.classList.add("headerFont", "newsText");

    appElement.appendChild(this.headerElement);
    this.headerElement.appendChild(linkhuText);
    this.headerElement.appendChild(newsText);
  }

  createElement(tag, textContent = "") {
    const element = document.createElement(tag);
    element.textContent = textContent;
    return element;
  }
}

class Nav {
  constructor(appElement) {
    this.navElement = this.createElement("nav");
    TAP_NAME.forEach((nav) => {
      const tabElement = this.createElement("button", nav.ko);
      tabElement.classList.add("tab", "sensedButton");
      this.navElement.appendChild(tabElement);
    });
    appElement.appendChild(this.navElement);

    const underline1 = this.createElement("div");
    underline1.classList.add("underline1");
    appElement.appendChild(underline1);

    const underline2 = this.createElement("div");
    underline2.classList.add("underline2");
    appElement.appendChild(underline2);
  }

  createElement(tag, textContent = "") {
    const element = document.createElement(tag);
    element.textContent = textContent;
    return element;
  }
}

class App {
  constructor() {
    this.appElement = document.getElementById("app");
    this.results = [];

    this.createHeader();
    this.createNav();
    this.start();
  }

  createElement(tag, textContent = "") {
    const element = document.createElement(tag);
    element.textContent = textContent;
    return element;
  }

  createHeader() {
    this.header = new Header(this.appElement);
  }

  createNav() {
    this.nav = new Nav(this.appElement);
  }

  start() {
    this.apiManager().then(() => this.createAndPutContents());
  }

  async apiManager() {
    const apiKey = process.env.API_KEY;

    try {
      this.results = {};

      const apiPromises = TAP_NAME.map(async (nav) => {
        const topic = `${nav.ko}`;
        let apiUrl;

        if (topic === "전체보기") {
          apiUrl = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${apiKey}`;
        } else {
          apiUrl = `https://newsapi.org/v2/everything?q=${topic}&apiKey=${apiKey}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        this.results[topic] = data.articles.slice(0, 2);
      });

      await Promise.all(apiPromises);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  createAndPutContents() {
    const sectionElement = this.createElement("section");
    this.appElement.appendChild(sectionElement);

    for (let articleIndex = 0; articleIndex < 2; articleIndex++) {
      const image = this.createElement("img");
      image.classList.add(`image`);
      sectionElement.appendChild(image);

      const reporter = this.createElement("p");
      reporter.classList.add(`reporter`);
      sectionElement.appendChild(reporter);

      const title = this.createElement("p");
      title.classList.add(`title`);
      sectionElement.appendChild(title);

      const description = this.createElement("p");
      description.classList.add(`description`);
      sectionElement.appendChild(description);

      const date = this.createElement("p");
      date.classList.add(`date`);
      sectionElement.appendChild(date);

      const sensedButtons = document.querySelectorAll(".sensedButton");

      sensedButtons.forEach((button) => {
        let selectedArticles = this.results["전체보기"];
        if (selectedArticles && selectedArticles[articleIndex]) {
          // 둘다 존재한다면
          const article = selectedArticles[articleIndex];

          if (article.urlToImage) {
            //가 존재한다면
            image.src = article.urlToImage;
          }

          title.textContent = article.title || "No Title";
          description.textContent = article.description || "No Description";
          reporter.textContent = `Reporter: ${article.author || "Unknown"}`;
          date.textContent = `Published At: ${
            article.publishedAt || "No Date"
          }`;
        }

        button.addEventListener("click", () => {
          selectedArticles = this.results[button.textContent];
          if (selectedArticles && selectedArticles[articleIndex]) {
            // 둘다 존재한다면
            const article = selectedArticles[articleIndex];

            if (article.urlToImage) {
              //가 존재한다면
              image.src = article.urlToImage;
            }

            reporter.textContent = `Reporter: ${article.author || "Unknown"}`;
            title.textContent = article.title || "No Title";
            description.textContent = article.description || "No Description";
            date.textContent = `Published At: ${
              article.publishedAt || "No Date"
            }`;
          }
        });
      });
    }
  }
}

const app = new App();

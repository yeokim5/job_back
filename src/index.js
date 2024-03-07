const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors"); // Import the cors middleware

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

const anyang_links = [
  "https://www.auc.or.kr/base/board/list?boardManagementNo=14&menuLevel=3&menuNo=61&searchCategory=&searchType=total&searchWord=%EA%B3%B5%EA%B0%9C",
  "https://www.auc.or.kr/base/board/list?boardManagementNo=14&menuLevel=3&menuNo=61&searchCategory=&searchType=total&searchWord=%EC%A7%81%EC%9B%90",
  "https://www.auc.or.kr/base/board/list?boardManagementNo=14&menuLevel=3&menuNo=61&searchCategory=&searchType=total&searchWord=%EC%B2%AD%EB%85%84",
];

const gunpo_links = [
  "https://www.gunpouc.or.kr/fmcs/222?page_size=20&search_field=ALL&search_word=%EC%B2%AD%EB%85%84",
  "https://www.gunpouc.or.kr/fmcs/222?page_size=20&search_field=ALL&search_word=%EA%B3%B5%EA%B0%9C",
  "https://www.gunpouc.or.kr/fmcs/222?page_size=20&search_field=ALL&search_word=%EC%A7%81%EC%9B%90",
];

const ulinks = [
  "https://www.uuc.or.kr:443/base/board/list?boardManagementNo=19&menuLevel=3&menuNo=87&searchCategory=&searchType=total&searchWord=",
];
const gang_links = [
  "https://www.gmuc.co.kr/user/board/boardList.do?code=BD_CJ",
];

const gachn_link = ["https://www.gcuc.or.kr/fmcs/227"];

app.get("/", async (req, res) => {
  try {
    const anyangData = await scrapeAnyangLinks(anyang_links);
    const uyangData = await scrapeULinks(ulinks);
    const gunpoData = await scrapeGunpoLinks(gunpo_links);
    const gangData = await scrapeGangLinks(gang_links);
    const gachunData = await scrapeGachnLinks(gachn_link);
    const allData = [
      ...anyangData,
      ...gunpoData,
      ...gangData,
      ...gachunData,
      ...uyangData,
    ];

    // Function to calculate date difference in days
    function getDateDifference(dateString) {
      const today = new Date();
      const targetDate = new Date(dateString);
      const timeDiff = targetDate.getTime() - today.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return dayDiff;
    }

    // Update "date" field with date difference
    allData.forEach((item) => {
      const dateDifference = getDateDifference(item.date);
      item.date = dateDifference.toString() + "일전"; // Convert to string
    });

    console.log(allData); // Log the data to see what's being collected

    res.json(allData);
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ error: error.message });
  }
});

async function scrapeAnyangLinks(links) {
  const allData = [];
  for (const link of links) {
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const firstTr = $("tbody tr").first();
    const linkUrl = firstTr.find(".tit a").attr("href");
    const title = firstTr.find(".tit a").text().trim();
    const date = firstTr.find(".date").text().trim();
    const views = firstTr.find(".view").text().trim();
    allData.push({ place: "안양: 키워드별 공고", link: linkUrl, title, date });
  }
  return allData;
}

async function scrapeULinks(links) {
  const allData = [];
  for (const link of links) {
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const firstTr = $("tbody tr").first();
    const linkUrl = firstTr.find(".tit a").attr("href");
    const title = firstTr.find(".tit a").text().trim();
    const date = firstTr.find(".date").text().trim();
    const views = firstTr.find(".view").text().trim();
    allData.push({ place: "의왕: 그냥 최근공구", link: linkUrl, title, date });
  }
  return allData;
}

async function scrapeGunpoLinks(links) {
  const allData = [];
  for (const link of links) {
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const firstTr = $("tbody tr").first();
    const linkUrl =
      "https://www.gunpouc.or.kr/fmcs/222" + firstTr.find("a").attr("href");
    const title = firstTr.find(".txtleft a").text().trim();
    const date = firstTr.find("td:nth-child(4)").text().trim();
    allData.push({ place: "군포: 키워드별 공고", link: linkUrl, title, date });
  }
  return allData;
}

async function scrapeGangLinks(links) {
  const allData = [];
  for (const link of links) {
    try {
      const response = await axios.get(link);
      const html = response.data;
      const $ = cheerio.load(html);
      const firstTr = $("tbody tr").first();
      const linkUrl =
        "https://www.gmuc.co.kr/user/board/boardList.do?code=BD_CJ";
      const title = firstTr.find(".title a").text().trim();
      const date = firstTr.find("td:nth-child(3)").text().trim();
      const writer = firstTr.find("td:nth-child(4)").text().trim();
      const views = firstTr.find("td:nth-child(5)").text().trim();
      allData.push({
        place: "광명: 그냥 최근공고",
        link: linkUrl,
        title,
        date,
      });
    } catch (error) {
      console.error("Error scraping gang_links:", error);
    }
  }
  return allData;
}

async function scrapeGachnLinks(links) {
  const allData = [];
  for (const link of links) {
    try {
      const response = await axios.get(link);
      const html = response.data;
      const $ = cheerio.load(html);
      const firstTr = $("tbody tr").first();
      const linkUrl =
        "https://www.gcuc.or.kr/fmcs/227" + firstTr.find("a").attr("href");
      const title = firstTr.find("a").text().trim();
      const department = firstTr.find("td:nth-child(3)").text().trim();
      const date = firstTr.find("td:nth-child(4)").text().trim();
      const period = firstTr.find("td:nth-child(5)").text().trim();
      const status = firstTr.find("td:nth-child(6) em").attr("class");
      allData.push({
        place: "과천: 그냥 최근공고",
        link: linkUrl,
        title,
        date,
      });
    } catch (error) {
      console.error("Error scraping gachn_link:", error);
    }
  }
  return allData;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

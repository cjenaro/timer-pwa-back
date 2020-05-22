const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const HTMLParser = require("node-html-parser");

const parseSeconds = (t) => {
  const parts = t.split(":");
  const minutes = parseInt(parts[0]);
  const seconds = parseInt(parts[1]);
  return minutes * 60 + seconds;
};

app.use(cors());
app.use(express.json());
app.get("/", async function (req, res) {
  if (!req.query.url) throw new Error("No URL was passed!");

  try {
    const { data, error } = await axios
      .get(req.query.url, {
        headers: {
          Origin: "http://www.intervaltimer.com",
        },
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });

    const html = HTMLParser.parse(data, { style: true });
    const intervals = Array.from(html.querySelectorAll(".preview-list-item"));
    const parsedIntervals = intervals.map((interval) => {
      const parts = interval.rawText.split(" ");
      const duration = parseSeconds(parts.pop());
      const name = parts.join(" ");
      let color = "";
      const rawS = interval.rawAttrs.split(": ");
      const styleParts = rawS
        .flatMap((p) => p.split('="'))
        .flatMap((p) => p.split(";"));
      const bColorIndex = styleParts.findIndex((v) => v === "background-color");

      if (bColorIndex !== -1 && bColorIndex < styleParts.length - 1) {
        color = styleParts[bColorIndex + 1];
      }

      return { duration, name, color };
    });

    res.json(parsedIntervals);
  } catch (err) {
    console.log(e);
    throw err;
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Api running on port: ${PORT}`);
});

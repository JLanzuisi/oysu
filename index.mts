import express from "express";
import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";

const app = express();
const port = 3000;

const appName = "oysu";
const dbName = appName + "db";
const vidPath = process.env.HOME + "/" + appName;
const dbPath = vidPath + "/." + dbName;
const subsFile = "./youtube_subs.opml";

function logInfo(mes: string) {
  console.log("INFO: " + mes);
}

async function fetchXML(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return await response.text();
}

const db = new sqlite3.Database(dbPath);

console.log(vidPath, dbPath);

async function parse_subscriptions() {
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const parsed = parser.parse(readFileSync(subsFile, "utf8"));

  const channelXML = await fetchXML(
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCEbYhDd6c6vngsF5PQpFVWg"
  );
  const channelParsed = parser.parse(channelXML);
  console.log(channelParsed.feed.entry);

  for (const key in parsed.opml.body.outline.outline) {
    for (const innerKey in parsed.opml.body.outline.outline[key]) {
      if (innerKey == "@_xmlUrl") {
        // console.log(parsed.opml.body.outline.outline[key][innerKey]);
      }
    }
  }
}

parse_subscriptions();

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { title: "Hey", message: "Hello there!" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// TODOS
// reorganize project:
//   * We should have two files deamon.mts and server.mts
//   * The deamon should periodically be called to fetch new videos,
//     add them to the database and to the filesystem.
//   * The server should be the UI
//   * The server should import some interfaces from the daemon
//     so that one can, say, ask for a specific video to be added
//     to the db; or ask for a manual fetch for all channels.

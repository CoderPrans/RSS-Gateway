import type { Route } from "./+types/home";
import { Form, Outlet } from "react-router";
import axios from "axios";
import FeedList from "../feed-list";
import fs from 'fs';
import * as cheerio from "cheerio";

export let filePath = "feeds.json";

export type Feeds = {
  [url: string]: string 
}

let feeds: Feeds = {};

async function findRSSFeeds(url: string) {
  let commons: string[] = ["rss", "feed", "feed.xml", "rss.xml"];

  try {
    const res = await axios.get(url, {
      headers: {"Accept": "application/rss+xml, application/xml"}
    });
    const $ = cheerio.load(res.data, {xmlMode: true});

    let title = $("title").first().text();

    let postTags = ["entry", "item"];
    let tag = postTags.find(t => $(t).length > 0)

    if (title && tag) {
      feeds[url] = `${title};${url}`;

    } else if (url.includes("youtube.com")) {
      const res = await axios.get(url);

      if (res.status == 200) {
        let $ = cheerio.load(res.data);
        const feed_url = $("link[type=application/rss+xml]").attr("href") ?? "";

        let xml = await axios.get(feed_url, {
          headers: {"Accept": "application/rss+xml, application/xml"}
        });

        if(xml.status == 200) {
          $ = cheerio.load(xml.data, {xmlMode: true});

          let title = $("title").first().text();
          feeds[url] = `${title};${feed_url}`;
        }
      }

    } else {
      const commonFeeds = commons.map(c => `${url}/${c}`); 

      const promises = commonFeeds.map(async (f) => {
        try {
          const res = await axios.get(f, {
            headers: {"Accept": "application/rss+xml, application/xml"}
          });

          if (res.status === 200) {
            const $ = cheerio.load(res.data, {xmlMode: true});

            let title = $("title").first().text();
            feeds[url] = `${title};${f}`;
          }
        } catch (e) {
          console.error(`Error fetching ${f}: `, e.response.status)
        }
      });

      await Promise.all(promises);
    }
  } catch (e) {
    console.error(`Error finding RSS Feeds for ${url} `);
  }
}

export async function loader({}: Route.LoaderArgs) {
  // reading db
  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    feeds = JSON.parse(data);
  } catch (err) {
    console.error('Error reading db file');
  }
  return { feeds: feeds };
}

export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData(); 
  const searchFor = data.get("url");

  if(typeof searchFor == "string") await findRSSFeeds(searchFor);

  // writing to db
  fs.writeFile(filePath, JSON.stringify(feeds, null, 2), err => {
    if (err) { console.error('Error writing db file') } 
    else { console.log('JSON data has been written to db file: ', filePath) }
  })
  return "ok";
}

export default function Home({ loaderData }: Route.ComponentProps) {
  let {feeds} = loaderData;

  return (
    <div className="flex">
      <div className="w-84 m-20">
        <Form method="post" navigate={false} action="">
        <label className="mt-2 block">
         Add: &nbsp;
         <input placeholder="Podcast Feed, Blog or Youtube Channel URL" className="w-full p-1 rounded-sm text-black bg-white shadow" type="text" name="url" />
         </label>
        </Form>

        <FeedList feeds={feeds} /> 
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
  </div>);
}


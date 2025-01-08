import type { Route } from "./+types/home";
import { Form } from "react-router";
import axios from "axios";
import FeedList from "../feed-list";
import fs from 'fs';
import * as cheerio from "cheerio";

export let filePath = "feeds.json";

export type Feeds = {
  [url: string]: string 
}

let feeds: Feeds = {};

async function findRSSFeeds(title: string, url: string) {
  let commons: string[] = ["rss", "feed", "rss.xml", "feed.xml"];
  let urlFragment: string = url.split("/").at(-1) ?? "";

  try {
    if (commons.includes(urlFragment)) {
      feeds[url] = `${title};${url}`;

    } else if (url.includes("youtube")) {
      const res = await axios.get(url);

      if (res.status == 200) {
        const $ = cheerio.load(res.data);
        const feed_url = $("link[type=application/rss+xml]").attr("href");
        feeds[url] = `${title};${feed_url}`;
      }
    } else {
        const commonFeeds = commons.map(c => `https://${url}/${c}`); 

        const promises = commonFeeds.map(async (f) => {
          const res = await axios.get(f, {
            headers: {"Accept": "application/rss+xml, application/xml"}
          });

          if (res.status === 200) {
            feeds[url] = `${title};${f}`;
          }
        });

        await Promise.all(promises);
    }
  console.log('?:: ', urlFragment, urlFragment in commons);
  } catch (e) {
    console.error(`Error finding RSS Feeds for ${url}: `, e);
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
  const title = data.get("title");

  if(typeof searchFor == "string") await findRSSFeeds(title, searchFor);

  // writing to db
  fs.writeFile(filePath, JSON.stringify(feeds, null, 2), err => {
    if (err) { console.error('Error writing db file') } 
    else { console.log('JSON data has been written to db file: ', filePath) }
  })
  return "ok";
}

export default function New({ loaderData }: Route.ComponentProps) {
  let {feeds} = loaderData;

  return (<div className="w-2/3 mx-auto mt-20">
    <Form method="post" navigate={false} action="/new">
    <label className="mt-2 block">
     Title
     <br />
     <input className="p-1 rounded-sm text-black bg-white shadow" type="text" name="title" />
    </label>
    <label className="mt-2 block">
     URL
     <br />
     <input placeholder="Feed URL, Blog URL or Youtube Channel" className="p-1 rounded-sm text-black bg-white shadow" type="text" name="url" />
     </label>
     <br />
     <button className="bg-green-700 text-white rounded-sm px-3 py-0.5 shadow cursor-pointer" type="submit">Search</button>
    </Form>

    <FeedList feeds={feeds} /> 
  </div>);
}


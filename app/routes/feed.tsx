import type { Route } from "./+types/home";
import { type Feeds, filePath } from "./new";
import { getSlug } from "../feed-list"
import fs from "fs";
import * as cheerio from "cheerio";

type Post = {
  [key: string]: string
}

export async function loader({ params }: Route.LoaderArgs) {
  let feeds: Feeds = {};
  let key = params.key;

  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    feeds = JSON.parse(data);
  } catch (err) {
    console.error('Error reading db file from /feed/:key');
  }

  let url = (key && feeds) 
    ? Object.values(feeds).find(v => v 
          && getSlug(v.split(';').at(0)?.toLowerCase() ?? "") === key 
      )
    : "nothing";

  url = url?.split(';').at(1)

  let xml = await fetch(url || "");

  let posts: Post[] = [];

  if(xml) {
    let xmldata: string = await xml.text();
    const $ = cheerio.load(xmldata, {xmlMode: true});

    let postTags = ["entry", "item"];
    let tag = postTags.find(t => $(t).length > 0)

    const entries = $(tag)
    entries.each((i, entry) => {
      posts.push({
        title: $(entry).find('title').text(),
        link: $(entry).find('link').attr('href') ?? $(entry).find('link').text(),
        pubDate:  ($(entry).find('published').length ? $(entry).find('published') : $(entry).find('pubDate')).text(),
        content: $(entry).find('content').text()
      })
    })
  }

 return {url, posts}; 
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h2>The Feed for {loaderData.url}</h2>
      <hr />
      <br />
      {loaderData.posts.map((p: Post) => (
          <div className="flex flex-row mb-5" key={p.title}>
            {/*p.thumbnail?.length > 0 
              ? <img src={p.thumbnail} className="w-40" /> 
              : null*/}
            <div>
              <a href={p.link} target="_blank"><p>{p.title}</p></a>
              <p>{p.pubDate}</p>
              <p>{p.content}</p>
            </div>
          </div>
        )
      )}
    </>
  );
}

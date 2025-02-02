import type { Route } from "./+types/home";
import { type Feeds, filePath } from "./new";
import { getSlug } from "../feed-list"
import fs from "fs";

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

  let response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${url}`);

  let posts: Post[] = [];

  if(response.ok) {
    let data = await response.json();
    if (data && data.items) {
      data.items.map((post: Post) => {
        posts.push(post as Post)
      })
    }
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
            {p.thumbnail.length > 0 
              ? <img src={p.thumbnail} className="w-40" /> 
              : null}
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

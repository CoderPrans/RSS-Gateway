import type { Route } from "./+types/home";
import { type Feeds, filePath } from "./new";
import fs from "fs";

export async function loader({ params }: Route.LoaderArgs) {
  let feeds: Feeds = {};
  let key = params.key;

  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    feeds = JSON.parse(data);
  } catch (err) {
    console.error('Error reading db file from /feed/:key');
  }

  let url = (key && key in feeds) ? feeds[key] : 'nothing'; 

 return {url}; 
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  return <h2>The Feed for {loaderData.url}</h2> 
}

import { NavLink } from "react-router";
import type { Feeds } from "./routes/new";

export function getSlug(feedInfo: string): string {
  let title = feedInfo.split(';').at(0) ?? "";
  return title.replace(/ /g, '-').toLowerCase();
}

export default function FeedList({feeds}: {feeds: Feeds}) {

  return <div className="mt-20">{
    feeds && Object.entries(feeds).map(
    ([k, v]) => 
    <NavLink prefetch="viewport" key={k} to={`/feed/${getSlug(v)}`}>
      <p className="hover:bg-yellow-500 hover:text-black">{(v.split(';')?.at(0) as string) ?? ""}</p>
    </NavLink>
  )}
  </div>
}

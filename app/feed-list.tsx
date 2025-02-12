import { NavLink, useParams } from "react-router";
import type { Feeds } from "./routes/home";

export function getSlug(feedInfo: string): string {
  let title = feedInfo.split(';').at(0) ?? "";
  return title.replace(/ /g, '-').toLowerCase();
}

export default function FeedList({feeds}: {feeds: Feeds}) {
  let { key } = useParams();

  return <div className="mt-20">{
    feeds && Object.entries(feeds).map(
    ([k, v]) => 
    <NavLink prefetch="viewport" key={k} to={`feed/${getSlug(v)}`}>
      <p className={`hover:bg-yellow-500 hover:text-black 
          ${getSlug(v) === key ? "bg-yellow-500 text-black" : ""}
        `}>{(v.split(';')?.at(0) as string) ?? ""}</p>
    </NavLink>
  )}
  </div>
}

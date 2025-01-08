import { NavLink } from "react-router";
import type { Feeds } from "./routes/new";

export default function FeedList({feeds}: {feeds: Feeds}) {

  return feeds && Object.entries(feeds).map(
    ([k, v]) => 
    <NavLink key={k} to={`/feed/${k}`}>
      <p>{(v as string) ?? ""}</p>
    </NavLink>
  )
}

Object.entries

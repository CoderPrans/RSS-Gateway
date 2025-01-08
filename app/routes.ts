import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),

  route("/new", "./routes/new.tsx"),
  route("/feed/:key", "./routes/feed.tsx")
] satisfies RouteConfig;

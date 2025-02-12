import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

  route("/", "./routes/home.tsx", [
    //index("./routes/feed.tsx"),
    route("feed/:key", "./routes/feed.tsx")
  ]),
] satisfies RouteConfig;


import createRouteMatcher from "feather-route-matcher";

// import our page routes
import Home from "../app_pages/home";
import LocationDetail from "../app_pages/location-detail";

const matcher = createRouteMatcher({
  "/": Home,
  "/locations/:name": LocationDetail,
  "*": Home,
});

// build out our hook
function useRouter() {
  const pathname = window.location.pathname;
  const route = matcher(pathname);
  return [route.value, route.params];
}

export default useRouter;

import {
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "remix";
import type { MetaFunction } from "remix";
import clsx from "clsx";
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "~/components/ThemeProvider";

import openGraphImage from "~/assets/images/opengraph.png";

export const meta: MetaFunction = ({ location }) => {
  const description =
    "JSON Hero makes reading and understand JSON files easy by giving you a clean and beautiful UI packed with extra features.";

  // TODO: Read hostname and insert it into og metadata
  return {
    title: "JSON Viewer - JSON Hero",
    viewport: "width=device-width,initial-scale=1",
    description,
    "og:image": `https://example.com/${openGraphImage}`,
    "og:url": `https://example.com/${location.pathname}`,
    "og:title": "JSON Hero - A beautiful JSON viewer",
    "og:description": description,
    "twitter:image": `https://example.com/$${openGraphImage}`,
    "twitter:card": "summary_large_image",
    "twitter:title": "JSON Hero",
    "twitter:description": description,
  };
};

import styles from "./tailwind.css";
import { getThemeSession } from "./theme.server";
import { getStarCount } from "./services/github.server";
import { StarCountProvider } from "./components/StarCountProvider";
import { PreferencesProvider } from "~/components/PreferencesProvider";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export type LoaderData = {
  theme?: Theme;
  starCount?: number;
  themeOverride?: Theme;
};

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const starCount = await getStarCount();
  const themeOverride = getThemeFromRequest(request);

  const data: LoaderData = {
    theme: themeSession.getTheme(),
    starCount,
    themeOverride,
  };

  return data;
};

function getThemeFromRequest(request: Request): Theme | undefined {
  const url = new URL(request.url);
  const theme = url.searchParams.get("theme");
  if (theme) {
    return theme as Theme;
  }
  return undefined;
}

function App() {
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(theme)} />
      </head>
      <body className="overscroll-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const { theme, starCount, themeOverride } = useLoaderData<LoaderData>();

  const location = useLocation();

  // Force dark mode on the homepage
  const forceDarkMode = location.pathname === "/";

  return (
    <ThemeProvider
      specifiedTheme={theme}
      themeOverride={forceDarkMode ? "dark" : themeOverride}
    >
      <PreferencesProvider>
        <StarCountProvider starCount={starCount}>
          <App />
        </StarCountProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

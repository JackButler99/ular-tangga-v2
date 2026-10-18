import "server-only";

import { cookies } from "next/headers";

import {
  APP_LOCALE_COOKIE,
  DEFAULT_APP_LOCALE,
  isAppLocale,
} from "./locale";

export async function getServerLocale() {
  const value = (await cookies()).get(APP_LOCALE_COOKIE)?.value;
  return isAppLocale(value) ? value : DEFAULT_APP_LOCALE;
}

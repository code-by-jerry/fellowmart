import type { PlpSearchParams } from "@/lib/storefront/plp-facets";

type SearchParamsInput =
  | URLSearchParams
  | string
  | Record<string, string | string[] | undefined>;

function readParam(
  input: SearchParamsInput,
  key: string,
): string | undefined {
  if (typeof input === "string") {
    return readParam(new URLSearchParams(input), key);
  }
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }
  const value = input[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parsePlpSearchParams(input: SearchParamsInput): PlpSearchParams {
  return {
    q: readParam(input, "q"),
    sort: readParam(input, "sort"),
    brand: readParam(input, "brand"),
    tag: readParam(input, "tag"),
    sale: readParam(input, "sale"),
    min: readParam(input, "min"),
    max: readParam(input, "max"),
  };
}

export function serializePlpSearchParams(params: PlpSearchParams): string {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.sort && params.sort !== "newest") search.set("sort", params.sort);
  if (params.brand?.trim()) search.set("brand", params.brand.trim());
  if (params.tag?.trim()) search.set("tag", params.tag.trim());
  if (params.sale === "1") search.set("sale", "1");
  if (params.min?.trim()) search.set("min", params.min.trim());
  if (params.max?.trim()) search.set("max", params.max.trim());

  return search.toString();
}

export function clearPlpFilterParams(params: PlpSearchParams): PlpSearchParams {
  return params.q?.trim() ? { q: params.q.trim() } : {};
}

export function syncPlpParamsToUrl(params: PlpSearchParams) {
  if (typeof window === "undefined") return;
  const query = serializePlpSearchParams(params);
  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(window.history.state, "", nextUrl);
}

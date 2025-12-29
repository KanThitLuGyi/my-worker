export function paginateUrl(baseUrl, page = 1) {
  if (!baseUrl) {
    throw new Error("paginateUrl: baseUrl required");
  }


  if (!page || page <= 1) return baseUrl;

  // xhamster uses /pageNumber
  return baseUrl.endsWith("/")
    ? `${baseUrl}${page}`
    : `${baseUrl}/${page}`;

  return `${baseUrl}/${page}`;

}

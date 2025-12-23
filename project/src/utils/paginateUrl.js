export function paginateUrl(baseUrl, page = 1) {
  if (page <= 1) return baseUrl;
if(baseUrl.endsWith('/')) {
    return `${baseUrl}${page}`;
  }
  return `${baseUrl}/${page}`;
}
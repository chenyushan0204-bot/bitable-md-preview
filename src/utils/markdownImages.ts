export function extractImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  const pattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match = pattern.exec(markdown);
  while (match) {
    urls.push(match[1]);
    match = pattern.exec(markdown);
  }
  return urls;
}

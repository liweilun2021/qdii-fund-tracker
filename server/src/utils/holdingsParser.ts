import { StockHolding } from '../../../shared/types';

export function parseHoldingsHtml(html: string): StockHolding[] {
  // Response format: var apidata={ content:"<div>...</div>",arryear:[...],curyear:N};
  // Extract the content value — greedy match up to the last quote before ,arryear
  const contentMatch = html.match(/content:"([\s\S]*)"\s*,\s*arryear/);
  if (!contentMatch) return [];

  const content = contentMatch[1];
  if (!content || content.length < 10) return [];

  // Only parse first quarter table (split by boxitem, take first)
  const tables = content.split('boxitem');
  if (tables.length < 2) return [];
  const firstTable = tables[1];

  // Actual row format:
  // <tr><td>1</td><td class='toc'><a href='...' >NVDA</a></td>
  // <td class='toc' style='...'><a href='...'>英伟达</a></td>
  // <td>...</td><td>...</td><td>...</td>
  // <td class='toc'>7.04%</td><td class='toc'>9.55</td><td class='toc'>11,521.99</td></tr>
  const rowPattern = /<tr><td>\d+<\/td><td class='toc'><a[^>]*>([^<]+)<\/a><\/td><td class='toc'[^>]*><a[^>]*>([^<]+)<\/a><\/td>[\s\S]*?<td class='toc'>(\d+\.?\d*)%<\/td>/g;

  const holdings: StockHolding[] = [];
  let match;
  while ((match = rowPattern.exec(firstTable)) !== null) {
    holdings.push({
      stockCode: match[1].trim(),
      stockName: match[2].trim(),
      percentage: parseFloat(match[3]),
    });
  }

  return holdings;
}

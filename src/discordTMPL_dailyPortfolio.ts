import { CoinDTODiscord, DiscordPayload } from './discord';
import { formatNumber, sortBy } from './lib';

// todo complete this function
function formatList(
  items: CoinDTODiscord[],
  icon: string,
  highlightIcon: string,
  formatter: (item: CoinDTODiscord) => string,
) {
  return items
    .map((item, i) => {
      const stars = highlightIcon.repeat(5 - i);
      const circles = icon.repeat(i);
      return `- ${circles}${stars} ${formatter(item)}`;
    })
    .join('\n');
}

export function discordTMPL_dailyPortfolio(
  dl: CoinDTODiscord[],
): DiscordPayload {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const top5_assets = sortBy(dl, 'current_val').slice(0, 5);
  const top5_gains = sortBy(dl, 'roi_change').slice(0, 5);
  const top5_loss = sortBy(dl, 'roi_change', false).slice(0, 5);
  const top5_24hchange = sortBy(dl, 'change24h').slice(0, 5);
  const last5_24hchange = sortBy(dl, 'change24h', false).slice(0, 5);

  const payload: DiscordPayload = {
    embeds: [
      {
        title: 'PORTFOLIO OVERVIEW',
        url: ss.getUrl(),
        timestamp: new Date(),
        description: '',
        fields: [
          {
            name: `:trophy: Top5 Biggest Assets :trophy:`,
            value: top5_assets
              .map(
                ({ markdown_link, roi }, i) =>
                  `- ${':black_circle:'.repeat(i)}${':star:'.repeat(5 - i)} ${markdown_link} **${formatNumber(roi, { suffix: '$' })}** (${formatNumber(roi, { includePlusSign: true, suffix: '$' })})`,
              )
              .join('\n'),
            inline: false,
          },
          {
            name: `:trophy: Top5 GAINS :trophy:`,
            value: top5_gains
              .map(
                ({ markdown_link, roi, roi_change }, i) =>
                  `- ${':black_circle:'.repeat(Math.round(i / 2))}${':star:'.repeat(Math.round((5 - i) / 2))} ${markdown_link} **${formatNumber(roi, { suffix: '$' })}** (${formatNumber(roi_change, { isPercentage: true, decimalPlaces: 0, suffix: '%' })})`,
              )
              .join('\n'),
            inline: true,
          },
          {
            name: `:skull: Top5 LOSSES :skull:`,
            value: top5_loss
              .map(
                ({ markdown_link, roi, roi_change }, i) =>
                  `- ${':black_circle:'.repeat(Math.round(i / 2))}${':ghost:'.repeat(Math.round((5 - i) / 2))} ${markdown_link} **${formatNumber(roi, { suffix: '$' })}** (${formatNumber(roi_change, { isPercentage: true, decimalPlaces: 0, suffix: '%' })})`,
              )
              .join('\n'),
            inline: true,
          },
          {
            name: `:trophy: Top5 CHANGE 24H :trophy:`,
            value: top5_24hchange
              .map(
                ({ change24h, markdown_link, low, price, high }, i) =>
                  `- ${':black_circle:'.repeat(i)}${':star:'.repeat(5 - i)} ${markdown_link} **${formatNumber(change24h, { isPercentage: true, suffix: '%' })}** (low = ${formatNumber(low, { includePlusSign: false, suffix: '$' })} > **${formatNumber(price, { includePlusSign: false, suffix: '$' })}** > max = ${formatNumber(high, { includePlusSign: false, suffix: '$' })})`,
              )
              .join('\n'),
            inline: false,
          },
          {
            name: `:skull: Last5 CHANGE 24H :skull:`,
            value: last5_24hchange
              .map(
                ({ markdown_link, change24h, low, high, price }, i) =>
                  `- ${':black_circle:'.repeat(i)}${':ghost:'.repeat(5 - i)} ${markdown_link} **${formatNumber(change24h, { isPercentage: true, suffix: '%' })}** (low = ${formatNumber(low, { includePlusSign: false, suffix: '$' })} > **${formatNumber(price, { includePlusSign: false, suffix: '$' })}** > max = ${formatNumber(high, { includePlusSign: false, suffix: '$' })})`,
              )
              .join('\n'),
            inline: false,
          },
        ],
        footer: {
          text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`,
        },
      },
    ],
  };
  return payload;
}

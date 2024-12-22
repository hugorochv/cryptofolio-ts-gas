import { DiscordPayload, MarketData } from './discord';
import { DataRange } from './importjson';

export function discordTMPL_dailyGlobal(dl: DataRange): DiscordPayload {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const [unembeddedDl] = dl;

  function stringifyNumber(value: string, usePrefix = false): string {
    const parsedValue = parseFloat(value);
    let out = '';

    if (parsedValue && usePrefix) {
      out = '+';
    }

    out += parseFloat(value).toLocaleString('fr');
    return out;
  }

  const datalayer: MarketData = {
    date: unembeddedDl[0] as string,
    url: ss.getUrl() as string,
    kpi_24h_change: ((unembeddedDl[1] as number) * 100).toFixed(2) || '',
    kpi_24h_amount: (unembeddedDl[2] as number).toFixed(2) || '',
    kpi_24h_delta: (unembeddedDl[11] as number).toFixed(2) || '',
    kpi_top500_1h_change: ((unembeddedDl[10] as number) * 100).toFixed(2) || '',
    kpi_top500_24h_change: ((unembeddedDl[9] as number) * 100).toFixed(2) || '',
    kpi_top500_7d_change: ((unembeddedDl[8] as number) * 100).toFixed(2) || '',
    kpi_top500_30d_change: ((unembeddedDl[7] as number) * 100).toFixed(2) || '',
    kpi_net_worth: (unembeddedDl[6] as number).toFixed(2) || '',
    kpi_deposit: (unembeddedDl[5] as number).toFixed(2) || '',
    display_currency: 'CAD',
    kpi_roi: (unembeddedDl[3] as number).toFixed(2) || '',
    kpi_roi_change: ((unembeddedDl[4] as number) * 100).toFixed(2) || '',
  };

  const increaseTrend = !!(parseFloat(datalayer['kpi_24h_change']) > 0);

  const payload = {
    embeds: [
      {
        color: increaseTrend ? 0x0099ff : 0xf08d49,
        title: `**${datalayer['date']}** - Global Daily Reporting (**${stringifyNumber(datalayer['kpi_24h_change'])}%**)`,
        url: datalayer['url'],
        timestamp: new Date(),
        description: `${increaseTrend ? 'Great, your portfolio has gained' : 'Ouch, your portfolio lost'} **${parseFloat(datalayer['kpi_24h_amount']).toLocaleString('fr')} ${datalayer['display_currency']}** in the last 24h. Here is a quick overview of your actual performances:`,
        fields: [
          {
            name: `Currency`,
            value: datalayer['display_currency'],
            inline: true,
          },
          {
            name: `Investment`,
            value: stringifyNumber(datalayer['kpi_deposit']),
            inline: true,
          },
          {
            name: `Net Worth`,
            value: stringifyNumber(datalayer['kpi_net_worth']),
            inline: true,
          },
          {
            name: `Market Delta (Δ)`,
            value: stringifyNumber(datalayer['kpi_24h_delta']),
            inline: true,
          },
          {
            name: `Gains/Loss`,
            value: stringifyNumber(datalayer['kpi_roi']),
            inline: true,
          },
          {
            name: 'ROI %',
            value: `${stringifyNumber(datalayer['kpi_roi_change'])}%`,
            inline: true,
          },
          {
            name: '24H %',
            value: `${stringifyNumber(datalayer['kpi_top500_24h_change'])}%`,
            inline: true,
          },
          {
            name: '7D %',
            value: `${stringifyNumber(datalayer['kpi_top500_7d_change'])}%`,
            inline: true,
          },
          {
            name: '30D %',
            value: `${stringifyNumber(datalayer['kpi_top500_30d_change'])}%`,
            inline: true,
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

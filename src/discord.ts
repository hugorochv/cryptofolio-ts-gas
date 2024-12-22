import { discordTMPL_dailyGlobal } from './discordTMPL_dailyGlobal';
import { discordTMPL_dailyMarket } from './discordTMPL_dailyMarket';
import { discordTMPL_dailyPortfolio } from './discordTMPL_dailyPortfolio';
import { Cell, DataRange } from './importjson';

export type DiscordPayload = {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: Record<string, any>[];
};

// todo: not sure if this is the best way to handle this
export type MarketData = {
  date: string;
  url?: string;
  kpi_24h_change: string;
  kpi_24h_amount: string;
  kpi_24h_delta: string;
  kpi_top500_1h_change: string;
  kpi_top500_24h_change: string;
  kpi_top500_7d_change: string;
  kpi_top500_30d_change: string;
  kpi_net_worth: string;
  kpi_deposit: string;
  display_currency: string;
  kpi_roi: string;
  kpi_roi_change: string;
};

export type CoinDTODiscord = {
  name: string;
  ticker: string;
  current_val: number;
  markdown_link: string;
  price: number;
  low: number;
  high: number;
  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  deposit: number;
  roi: number;
  roi_change: number;
  url: string;
};

export function postMessageToDiscord(
  webhook = '',
  customPayload: Partial<DiscordPayload> = {},
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet_url = ss.getUrl();
  const payloadDefault: Partial<DiscordPayload> = {
    avatar_url:
      'https://lh3.googleusercontent.com/yCF7mTvXRF_EhDf7Kun5_-LMYTbD2IL-stx_D97EzpACfhpGjY_Frx8NZw63rSn2dME0v8-Im49Mh16htvPAGmEOMhiTxDZzo6rB7MY',
  };
  const payload: DiscordPayload = { ...payloadDefault, ...customPayload };

  if (!webhook) {
    webhook = ss.getRangeByName('discord_webhook')?.getValue();
    if (!/^https?:\/\/[a-z]*/.test(webhook)) {
      Logger.log(`sending notification canceled - no valid webhook url`);
      return 'ERROR_NO_VALID_WEBHOOK';
    }
  }

  if (Object.keys(payload).length === 1) {
    payload.embeds = [
      {
        title: 'Bip! Bip! This is a test',
        description: `This notification has been triggered by :  ${gSheet_url}`,
      },
    ];
  }

  console.log(payload);

  const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(webhook, params);

    Logger.log(`notification sent to ${webhook}`);
    Logger.log(response);

    if ('message' in response) {
      Logger.log(response);
      return 'ERROR_INVALID_MESSAGE';
    }

    return 'SUCCESS';
  } catch (e) {
    const message = `error sending notification to ${webhook}: ${e}`;
    Logger.log(message);
    return 'ERROR_UNKNOWN';
  }
}

export function getTemplatePayload(
  dl: DataRange | CoinDTODiscord[],
  templateName: string,
) {
  let payload;
  switch (templateName) {
    case 'daily_global':
      payload = discordTMPL_dailyGlobal(dl as DataRange);
      break;
    case 'daily_market':
      payload = discordTMPL_dailyMarket(dl as CoinDTODiscord[]);
      break;
    case 'daily_portfolio':
      payload = discordTMPL_dailyPortfolio(dl as CoinDTODiscord[]);
      break;
    default:
      return;
  }
  return payload;
}

export function getDLCrypto(rawDL: DataRange): CoinDTODiscord[] {
  return rawDL
    .map((crypto: Cell[]) => ({
      name: crypto[2] as string,
      ticker: crypto[3] as string,
      current_val: crypto[13] as number,
      price: crypto[9] as number,
      low: crypto[23] as number,
      high: crypto[25] as number,
      change1h: crypto[4] as number,
      change24h: crypto[7] as number,
      change7d: crypto[8] as number,
      change30d: crypto[9] as number,
      deposit: crypto[10] as number,
      roi: crypto[17] as number,
      roi_change: crypto[18] as number,
      url: `https://www.coingecko.com/en/coins/${(crypto[2] as string)?.toLowerCase()}`,
    }))
    .filter((crypto) => crypto.name !== '--not sync--')
    .map((crypto) => ({
      ...crypto,
      markdown_link: `[${crypto.ticker}](${crypto.url})`,
    }));
}

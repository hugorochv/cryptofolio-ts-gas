import {
  postMessageToDiscord,
  getDLCrypto,
  getTemplatePayload,
} from './discord';
import { DataRange } from './importjson';
import {
  prepareDataRange,
  safeGuardImportJSON,
  storeRows2Sheet,
  updateCurrencyFormat,
} from './lib';
import { getToken, storeToken, validateToken } from './token';
import { appendCryptoToMarketSheet, isInRange } from './utils';

export { appendCryptoToMarketSheet } from './utils';
export {
  getDLCrypto,
  getTemplatePayload,
  postMessageToDiscord,
} from './discord';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Cryptofolio')
    .addItem('Create Triggers', 'createTriggers')
    .addItem('Refresh crypto prices', 'cgDataManualRefresh')
    .addItem('Discord - Test connection', 'testDiscord')
    .addItem('Discord - send reporting', 'dailyAlertTrigger')
    .addToUi();

  showTokenDialogz();
}

function showTokenDialogz() {
  const token = getToken();

  // Create an HTML output for the dialog
  let html = HtmlService.createHtmlOutputFromFile('tokenDialog')
    .setWidth(400)
    .setHeight(300);

  // Pass the token to the HTML template
  html = html.append(`<script>
    window.onload = function() {
      document.getElementById('tokenField').value = '${token}'; // Pre-fill the input field
    }
  </script>`);

  SpreadsheetApp.getUi().showModalDialog(html, 'Enter Token');
}

function promptForToken() {
  const ui = SpreadsheetApp.getUi();

  let promptTitle = 'New API Token';
  let promptMessage = 'Enter your API Token:';

  const cachedtoken = getToken();
  if (cachedtoken) {
    const response = ui.alert(
      'API Token already set',
      'Do you want to change it?',
      ui.ButtonSet.YES_NO,
    );

    if (response === ui.Button.NO) {
      return;
    }

    promptTitle = 'Edit API Token:';
    promptMessage = `current token: ${cachedtoken}`;
  }

  const responseEdit = ui.prompt(
    promptTitle,
    promptMessage,
    ui.ButtonSet.OK_CANCEL,
  );

  if (responseEdit.getSelectedButton() == ui.Button.OK) {
    const promptToken = responseEdit.getResponseText();

    if (!validateToken(promptToken)) {
      ui.alert('Invalid token. Please try again.');
      return;
    }

    storeToken(promptToken);
    if (promptToken !== getToken()) {
      ui.alert('Token not saved. Please try again.');
      return;
    }

    ui.alert('Token saved successfully');
  }
}

function createTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  if (allTriggers.length < 1) {
    initTriggers();
    SpreadsheetApp.getUi().alert(
      'Your triggers has been created. Syncronization of crypto prices enabled. Prices will be updated in a few minutes',
    );
  } else {
    SpreadsheetApp.getUi().alert(
      'Nothing done, your Spreadshet is already setup',
    );
  }
}

function initTriggers() {
  // Trigger every 2 hours.
  ScriptApp.newTrigger('cgDataRefresh').timeBased().everyMinutes(10).create();

  ScriptApp.newTrigger('storeRows2SheetTrigger')
    .timeBased()
    .everyHours(6)
    .create();

  ScriptApp.newTrigger('dailyAlertTrigger')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const marketSheet = ss.getSheetByName('Market (Mk)');
  if (!marketSheet) {
    return;
  }

  const trxCoinListRange = ss.getRange('crypto_opes');
  const marketCoinListRange = ss.getRange('crypto_market');
  const fiatCurrencyRange = ss.getRange('fiat_currency');
  const templateRange = ss.getRange('template_row_crypto');

  const currentActiveSheet = e.source.getActiveSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();

  if (currentActiveSheet.getName() === 'Settings') {
    if (isInRange(col, row, fiatCurrencyRange)) {
      updateCurrencyFormat();
    }
  } else if (currentActiveSheet.getName() === 'Transactions (Tx)') {
    if (isInRange(col, row, trxCoinListRange)) {
      const currentCoin = SpreadsheetApp.getActiveSheet()
        .getRange(row, col)
        .getValue()
        .toUpperCase();

      const knownCoins: DataRange = marketCoinListRange.getValues();

      if (!knownCoins.flat().includes(currentCoin)) {
        const choiceBtn = ui.alert(
          `New Crypto Detected: ${currentCoin}`,
          'do you want to add it?',
          ui.ButtonSet.OK_CANCEL,
        );

        if (choiceBtn === ui.Button.OK) {
          appendCryptoToMarketSheet(ss, currentCoin, templateRange);
        }
      }
    }
  }
}

function cgDataRefresh() {
  const apiKey = SpreadsheetApp.getActiveSpreadsheet()
    .getRangeByName('ApiKey')
    ?.getValue();

  const urls = [
    `https://us-central1-cryptofolio-428823.cloudfunctions.net/cryptofolio-get-coins`,
  ];

  const successCount = safeGuardImportJSON(urls, apiKey, 'db_coingecko');
  return successCount;
}

function cgDataManualRefresh() {
  const ui = SpreadsheetApp.getUi();

  try {
    cgDataRefresh();
    const uiMessage = `Price refresh completed.`;
    ui.alert('Status', uiMessage, ui.ButtonSet.OK);
  } catch (e: any) {
    ui.alert(
      'Error',
      `Unable to access cryptofolio api. check your api key and try again. ${e}`,
      ui.ButtonSet.OK,
    );
  }
}

function testDiscord() {
  const ui = SpreadsheetApp.getUi();
  const ping = postMessageToDiscord();
  let uiMessage: string;

  switch (ping) {
    case 'SUCCESS':
      uiMessage =
        'Test successful! The Google Sheet was correctly linked to your discord.';
      break;
    case 'ERROR_NO_VALID_WEBHOOK':
      uiMessage = `Test Failed. Please provide a valid webhook url in the sheet "SETTINGS".`;
      break;
    default:
      uiMessage = `Test Failed. there was a problem with the notification sent.`;
  }
  ui.alert('Discord Status', uiMessage, ui.ButtonSet.OK);
}

function storeRows2SheetTrigger() {
  const globalMetrics = prepareDataRange(
    'total',
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
  );

  storeRows2Sheet(globalMetrics, 'db_history');
}

function dailyAlertTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const discord = ss.getRangeByName('discord_webhook')?.getValue();
  if (!discord) return;

  const discord_daily_alert = ss.getRangeByName('discord_daily')?.getValue();
  if (!discord_daily_alert) return;

  const globalMetrics = prepareDataRange(
    'total',
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
  );

  const rawData = prepareDataRange('portfolio_detail');
  const cryptoData = getDLCrypto(rawData);

  // Reporting Section : Global
  const payload = getTemplatePayload(globalMetrics, 'daily_global');
  postMessageToDiscord(undefined, payload);

  // Reporting Section : Market
  const payload_market = getTemplatePayload(cryptoData, 'daily_market');
  postMessageToDiscord(undefined, payload_market);

  // Reporting Section : Portfolio
  const payload_portfolio = getTemplatePayload(cryptoData, 'daily_portfolio');
  postMessageToDiscord(undefined, payload_portfolio);
}

export {
  dailyAlertTrigger,
  storeRows2SheetTrigger,
  cgDataManualRefresh,
  testDiscord,
  cgDataRefresh,
  onEdit,
  onOpen,
  createTriggers,
  promptForToken,
};

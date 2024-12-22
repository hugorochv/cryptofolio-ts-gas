import {
  postMessageToDiscord,
  getDLCrypto,
  getTemplatePayload,
} from './discord';
import {
  prepareDataRange,
  safeGuardImportJSON,
  storeRows2Sheet,
  updateCurrencyFormat,
} from './lib';

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

  const sh = ss.getSheetByName('Market (Mk)');
  if (!sh) {
    return;
  }

  const myRange = ss.getRange('crypto_opes');
  const existingValues = ss.getRange('crypto_market');
  const uiFormat = ss.getRange('fiat_currency');

  const activeSheet = e.source.getActiveSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();

  if (activeSheet.getName() == 'Settings') {
    if (
      col >= uiFormat.getColumn() &&
      col <= uiFormat.getLastColumn() &&
      row >= uiFormat.getRow() &&
      row <= uiFormat.getLastRow()
    ) {
      updateCurrencyFormat();
    }
  } else if (activeSheet.getName() == 'Transactions (Tx)') {
    if (
      col >= myRange.getColumn() &&
      col <= myRange.getLastColumn() &&
      row >= myRange.getRow() &&
      row <= myRange.getLastRow()
    ) {
      const cellValue = SpreadsheetApp.getActiveSheet()
        .getRange(row, col)
        .getValue()
        .toUpperCase();
      const cryptoRange = existingValues.getValues();

      if (cryptoRange.flat().includes(cellValue) === false) {
        const choiceBtn = ui.alert(
          `New Crypto Detected: ${cellValue}`,
          'do you want to add it?',
          ui.ButtonSet.OK_CANCEL,
        );
        if (choiceBtn == ui.Button.OK) {
          const f = sh.getFilter();
          if (f != null && typeof f == 'object') {
            // todo: remove getrange
            f.getRange();
            f.remove();
          }

          const lRow = sh.getLastRow(),
            lCol = sh.getLastColumn();

          const range = ss.getRange('template_row_crypto');

          sh.insertRowsAfter(lRow, 1);
          range.copyTo(sh.getRange(lRow + 1, 1, 1, lCol), {
            contentsOnly: false,
          });
          sh.getRange(lRow + 1, 3, 1, 1).setValue(cellValue);

          ss.setNamedRange('portfolio_detail', sh.getRange('A13:AA'));
          ss.getRange('portfolio_detail').createFilter().sort(3, true);
        }
      }
    }
  }
}

function cgDataRefresh() {
  let currency = SpreadsheetApp.getActiveSpreadsheet()
    .getRangeByName('fiat_currency')
    ?.getValue();

  if (!currency) {
    currency = 'cad';
  }

  const urls = [
    `https://us-central1-cryptofolio-428823.cloudfunctions.net/cryptofolio-get-coins`,
  ];

  const count = safeGuardImportJSON(urls, 'db_coingecko_2');
  return count;
}

function cgDataManualRefresh() {
  cgDataRefresh();

  const ui = SpreadsheetApp.getUi();
  const uiMessage = 'notification';
  ui.alert('Price Refresh Status', uiMessage, ui.ButtonSet.OK);
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
};

function isInRange(
  col: number,
  row: number,
  range: GoogleAppsScript.Spreadsheet.Range,
): boolean {
  return (
    col >= range.getColumn() &&
    col <= range.getLastColumn() &&
    row >= range.getRow() &&
    row <= range.getLastRow()
  );
}

function appendCryptoToMarketSheet(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  coin: string,
  templateRange: GoogleAppsScript.Spreadsheet.Range,
): void {
  const sheet = ss.getSheetByName('Market (Mk)');
  if (!sheet) {
    return;
  }

  const filter = sheet.getFilter();
  if (filter !== null && typeof filter == 'object') {
    // todo: remove getrange
    filter.getRange();
    filter.remove();
  }

  const lastRow = sheet.getLastRow(),
    lastCol = sheet.getLastColumn();

  sheet.insertRowsAfter(lastRow, 1);
  templateRange.copyTo(sheet.getRange(lastRow + 1, 1, 1, lastCol), {
    contentsOnly: false,
  });

  sheet.getRange(lastRow + 1, 3, 1, 1).setValue(coin);

  ss.setNamedRange('portfolio_detail', sheet.getRange('A13:AA'));
  ss.getRange('portfolio_detail').createFilter().sort(3, true);
}

export { appendCryptoToMarketSheet, isInRange };

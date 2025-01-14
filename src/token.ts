function storeToken(token: string) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('API_TOKEN', token);
  Logger.log('Token stored successfully');
}

function getToken() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('API_TOKEN');

  if (token) {
    return token;
  }

  Logger.log('No token found');
  return null;
}

function clearToken() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('API_TOKEN');
  Logger.log('Token cleared');
}

function validateToken(promptToken: string) {
  const token = promptToken.trim();
  if (token.length === 0) {
    return false;
  }

  return true;
}

export { storeToken, getToken, clearToken, validateToken };

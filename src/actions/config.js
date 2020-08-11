import chalk from 'chalk';
import { saveCredentials, readCredentials } from '../lib/utils';

const { log } = console;

function logHelp() {
  log('algolia query [--apiKey=apiKey] [--appId=appId]');
}

export default function config(options) {
  if (options.help) {
    return logHelp();
  }

  if (!options.apiKey && !options.appId) {
    return log(chalk.red('You need to specify at least one of: apiKey | appId'));
  }

  const oldCredentials = readCredentials();
  const newCredentials = {};

  // eslint-disable-next-line
  options.apiKey ? newCredentials.apiKey = options.apiKey : null;
  // eslint-disable-next-line
  options.appId ? newCredentials.appId = options.appId : null;

  return saveCredentials({ oldCredentials, newCredentials });
}

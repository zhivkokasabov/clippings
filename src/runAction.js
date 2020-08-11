import inquirer from 'inquirer';
import config from './actions/config';
import help from './actions/help';
import query from './actions/query';
import { saveCredentials, readCredentials } from './lib/utils';

const guardedActions = ['query'];

async function requestCredentials(options) {
  if (
    options.action === 'config'
    || guardedActions.indexOf(options.action) < 0
  ) {
    return;
  }

  const fileName = './public/credentials.json';
  const credentials = readCredentials(fileName);
  const questions = [];

  if (!credentials.apiKey) {
    questions.push({
      type: 'input',
      name: 'apiKey',
      message: 'Enter api key:',
    });
  }

  if (!credentials.appId) {
    questions.push({
      type: 'input',
      name: 'appId',
      message: 'Enter application id:',
    });
  }

  if (!questions.length) {
    return;
  }

  const newCredentials = await inquirer.prompt(questions);

  saveCredentials({ fileName, oldCredentials: credentials, newCredentials });
}

export default function runAction(options) {
  requestCredentials(options);

  switch (options.action) {
    case 'config':
      return config(options);
    case 'query':
      return query(options);
    default:
      return help();
  }
}

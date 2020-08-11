import help from '../src/actions/help';
import query from '../src/actions/query';
import config from '../src/actions/config';
import runAction from '../src/runAction';
import inquirer from 'inquirer';
import { saveCredentials, readCredentials } from '../src/lib/utils';

// https://github.com/facebook/jest/issues/2582
let mockReturnAppId = false;
let mockReturnApiKey = false;

jest.mock('../src/actions/help');
jest.mock('../src/actions/config');
jest.mock('../src/actions/query');
jest.mock('../src/lib/utils', () => ({
    readCredentials: jest.fn(() => {
      if (mockReturnAppId) {
        return { appId: 2 };
      } else if (mockReturnApiKey) {
        return { apiKey: 2 };
      }

      return {};
    }),
    saveCredentials: jest.fn()
}));
inquirer.prompt = jest.fn(() => ({ appId: 13, apiKey: 13 }));

describe('runAction', () => {
  afterEach(() => {
    readCredentials.mockClear();
    saveCredentials.mockClear();
    help.mockClear();
    query.mockClear();
    config.mockClear();
    inquirer.prompt.mockClear();
    mockReturnAppId = false;
    mockReturnApiKey = false;
  });

  test('should call help by default', () => {
    runAction({});

    expect(help).toHaveBeenCalled();
  });

  test('should call query when action is query', () => {
    runAction({ action: 'query' });

    expect(query).toHaveBeenCalled();
  });

  test('should call config when action is config', () => {
    runAction({ action: 'config' });

    expect(config).toHaveBeenCalled();
  });

  test('should not call readCredentials when action is help', () => {
    runAction({ action: 'help' });

    expect(readCredentials).not.toHaveBeenCalled();
  });

  test('should call readCredentials when action is query', () => {
    runAction({ action: 'query' });

    expect(readCredentials).toHaveBeenCalledWith('./public/credentials.json');
  });

  test('should not call readCredentials when action is config', () => {
    runAction({ action: 'config' });

    expect(readCredentials).not.toHaveBeenCalledWith();
  });

  test('should not call readCredentials when action is config', () => {
    runAction({ action: 'config' });

    expect(readCredentials).not.toHaveBeenCalledWith();
  });

  test('should call prompt when no apiKey amd appid', () => {
    runAction({ action: 'query' });

    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter api key:',
      },
      {
        type: 'input',
        name: 'appId',
        message: 'Enter application id:',
      }
    ]);
  });

  test('should call prompt when no apiKey', () => {
    mockReturnAppId = true;
    runAction({ action: 'query' });

    expect(inquirer.prompt).toHaveBeenCalledWith([{
        type: 'input',
        name: 'apiKey',
        message: 'Enter api key:',
      }]
    );
  });

  test('should call prompt when no appid', () => {
    mockReturnApiKey = true;
    runAction({ action: 'query' });

    expect(inquirer.prompt).toHaveBeenCalledWith([{
        type: 'input',
        name: 'appId',
        message: 'Enter application id:',
      }]
    );
  });

  test('should call saveCredentials', (done) => {
    mockReturnApiKey = true;
    runAction({ action: 'query' });

    setTimeout(() => {
      expect(saveCredentials).toHaveBeenCalledWith({
        fileName: './public/credentials.json',
        oldCredentials: { apiKey: 2 },
        newCredentials: { apiKey:13, appId: 13 }
      });

      done();
    }, 100);
  });
});

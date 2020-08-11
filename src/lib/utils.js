import fs from 'fs';
import chalk from 'chalk';
import algoliasearch from 'algoliasearch/lite';

const { log } = console;
const fileName = './public/credentials.json';

function saveCredentials({ oldCredentials, newCredentials }) {
  fs.writeFileSync(
    fileName,
    JSON.stringify({ ...oldCredentials, ...newCredentials }),
  );

  log(chalk.green('Credentials saved successfully'));
}

function readCredentials() {
  const stream = fs.readFileSync(fileName);

  return JSON.parse(stream.toString());
}

class Client {
  constructor() {
    const credentials = readCredentials();

    this.indexes = [];
    this.client = algoliasearch(credentials.appId, credentials.apiKey);
  }

  getIndex(indexName) {
    const index = this.indexes.find((i) => i.name === indexName);

    if (index) {
      return new Promise((resolve) => {
        resolve(index);
      });
    }

    return this.createIndex(indexName);
  }

  createIndex(indexName) {
    return new Promise((resolve, reject) => {
      const newIndex = this.client.initIndex(indexName);

      newIndex.exists().then((res) => {
        if (res) {
          const index = {
            name: indexName,
            value: newIndex,
            fields: [],
          };

          this.indexes.push(index);
          resolve(index);
        }

        // eslint-disable-next-line
        reject('Index does not exist!');
      });
    });
  }

  switchToIndex(indexName) {
    if (!indexName) {
      // eslint-disable-next-line
      return Promise.reject('You need to specify index!');
    }

    return new Promise((resolve, reject) => {
      this.getIndex(indexName).then((index) => {
        resolve(index);
      }, (error) => {
        reject(error);
      });
    });
  }
}

const client = new Client();

export {
  saveCredentials,
  readCredentials,
  client,
};

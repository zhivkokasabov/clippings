import inquirer from 'inquirer';
import chalk from 'chalk';
import { client } from '../lib/utils';

const { log, table } = console;

class Search {
  constructor(options, index) {
    this.options = options;
    this.client = client;
    this.index = index;
    this.keywords = [
      'switchTo',
      'exit',
      'configureFields',
    ];
  }

  async waitForSearchTerm() {
    const result = await inquirer.prompt({
      type: 'input',
      name: 'searchTerm',
      message: 'Enter your search term: (exit to terminate)',
    });

    this.searchTerm = result.searchTerm;

    if (this.keywords.indexOf(this.searchTerm.split(' ')[0]) >= 0) {
      this.interceptKeyWords();
    } else {
      this.search();
    }
  }

  configure(overrideConfig) {
    if (!this.index.fields.length || overrideConfig) {
      return inquirer.prompt({
        type: 'input',
        name: 'fields',
        message: 'Configure fields to be displayed: , , ,',
      });
    }

    return Promise.resolve(this.index.fields);
  }

  search() {
    this.index.value.search(this.searchTerm).then(({ hits }) => {
      if (!hits.length) {
        log(chalk.yellow('No results'));

        return this.waitForSearchTerm();
      }

      const tableData = hits.map((hit) => {
        const row = {};

        this.index.fields.forEach((field) => {
          row[field] = hit[field];
        });

        return row;
      });
      table(tableData);

      return this.waitForSearchTerm();
    }, (error) => {
      log(chalk.red(error.message));

      return this.waitForSearchTerm();
    });
  }

  static splitFields(fieldsString) {
    return fieldsString.replace(' ', '').split(',');
  }

  switchTo() {
    const args = this.searchTerm.split(' ');

    client.switchToIndex(args[1]).then((index) => {
      this.index = index;

      this.configure().then((fields) => {
        if (fields.fields) {
          this.index.fields = this.splitFields(fields.fields);
        } else {
          this.index.fields = fields;
        }

        this.waitForSearchTerm();
      });
    }, (err) => {
      log(chalk.red(err));
      this.waitForSearchTerm();
    });
  }

  showIndexName() {
    log(chalk.green(this.index.name));
  }

  interceptKeyWords() {
    const args = this.searchTerm.split(' ');

    switch (args[0]) {
      case 'exit':
        break;
      case 'switchTo':
        this.switchTo();

        break;
      case 'showName':
        this.showIndexName();

        break;
      case 'configureFields':
        // eslint-disable-next-line
        const overrideConfig = true;

        this.configure(overrideConfig).then((fields) => {
          this.index.fields = this.splitFields(fields.fields);

          this.waitForSearchTerm();
        });

        break;
      default:
        this.search();
    }
  }
}

function logHelp() {
  log('algolia query [--index=indexName]');
  log('internal commands:');
  log('\t [**] triggers search in the current index');
  log('\t [switchTo=indexName] switches to specified index');
  log('\t [showName] returns current index name');
  log('\t [exit] terminates');
  log('\t [configureFields=[field, field, field]] configures table columns');
}

export default function query(options) {
  if (options.help) {
    return logHelp();
  }

  if (!options.index) {
    return log(chalk.red('You need to specify index'));
  }

  return client.getIndex(options.index).then((index) => {
    const search = new Search(options, index);

    search.configure().then((fieldsPrompt) => {
      search.index.fields = fieldsPrompt.fields.replace(' ', '').split(',');

      search.waitForSearchTerm();
    });
  }, (error) => {
    log(chalk.red(error));
  });
}

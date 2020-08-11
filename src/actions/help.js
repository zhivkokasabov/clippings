import chalk from 'chalk';

const { log } = console;

export default function help() {
  log(chalk.white('Usage: algolia <command>'));
  log('');
  log(chalk.white('where <command> is one of:'));
  log('\t config, help, query');
}

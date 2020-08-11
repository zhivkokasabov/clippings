import arg from 'arg';
import chalk from 'chalk';
import runAction from './runAction';

const { log } = console;

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--apiKey': String,
      '--appId': String,
      '--index': String,
      '--help': Boolean,
      '-c': '--config',
      '-h': '--help',
    },
    {
      argv: rawArgs.slice(2),
    },
  );

  return {
    apiKey: args['--apiKey'] || '',
    appId: args['--appId'] || '',
    index: args['--index'] || '',
    help: args['--help'] || false,
    action: args._[0],
  };
}

export default async function cli(args) {
  try {
    const options = parseArgumentsIntoOptions(args);

    if (!options.action) {
      log(chalk.red('You need to specify at least one action!'));
      log(chalk.green('For a list of possible actions use algolia help action #algolia help'));
    } else {
      runAction(options);
    }
  } catch (error) {
    log(chalk.red(error));
  }
}

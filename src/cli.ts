import yargs from 'yargs/yargs';
import { logger, nameToNum } from './logger';
import { Argv, ReportFormat, SchemaType } from './interfaces';
import { validate } from './validator';
import { Reporter } from './reporter';

const { version } = require('../package.json');

export async function run(): Promise<void> {
  const argv = parseArgv();
  logger.level = argv.logLevel;
  logger.silent = argv.silent;

  try {
    const errors = await validate(argv.filename, argv.schemaType);
    if (errors) {
      const reporter = new Reporter(argv.format);
      reporter.dump(errors);
    }
  } catch (err) {
    logger.error(err.message);
    process.exitCode = 1;
  }

  process.on('SIGINT', () => {
    logger.error('Forced termination');
    process.kill(process.pid, 'SIGINT');
  });
}

function parseArgv(): Argv {
  const argv = yargs(process.argv.slice(2))
    .command(
      'action <filename>',
      'Validate GitHub Actions metadata file',
      (yargs) => {
        return yargs.positional('filename', { type: 'string' });
      }
    )
    .command(
      'workflow <filename>',
      'Validate GitHub Actions workflow file',
      (yargs) => {
        return yargs.positional('filename', { type: 'string' });
      }
    )
    .demandCommand(1)
    .option({
      format: {
        alias: 'f',
        choices: ['json', 'table'],
        default: 'table',
        description:
          'The output format is json or table if validation error is found',
        type: 'string'
      },
      logLevel: {
        alias: 'l',
        choices: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        default: 'INFO',
        description: 'Logging level',
        type: 'string'
      },
      silent: {
        alias: 's',
        default: false,
        description: 'Suppress logging message',
        type: 'boolean'
      }
    })
    .version(version)
    .usage('Usage: $0 <command> [options]')
    .help().argv;

  return {
    filename: argv.filename as string,
    schemaType: argv._[0] as SchemaType,
    format: argv.format as ReportFormat,
    logLevel: nameToNum[argv.logLevel],
    silent: argv.silent
  };
}

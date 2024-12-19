#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
const program = new Command();

program
  .name('dgit')
  .description('Decentralized version control system CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new dgit repository')
  .action(() => {
    console.log(chalk.green('Initializing a new dgit repository...'));
    // Add logic for repository initialization
  });

program
  .command('commit')
  .description('Commit changes to the repository')
  .option('-m, --message <message>', 'Commit message')
  .action((options) => {
    if (!options.message) {
      console.error(chalk.red('Error: Commit message is required.'));
      process.exit(1);
    }
    console.log(chalk.green(`Committing with message: "${options.message}"`));
    // Add commit logic here
  });

program
  .command('push')
  .description('Push changes to the decentralized network')
  .action(() => {
    console.log(chalk.blue('Pushing changes to the decentralized network...'));
    // Add logic for pushing changes
  });

program.parse(process.argv);
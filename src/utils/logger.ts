import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray('[DEBUG]'), message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue('[INFO]'), message, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.green('✓'), message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow('[WARN]'), message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red('[ERROR]'), message, ...args);
    }
  }

  fatal(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red.bold('[FATAL]'), message, ...args);
    }
  }

  /**
   * Print section header
   */
  section(title: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log('\n' + chalk.bold.cyan(`=== ${title} ===`) + '\n');
    }
  }

  /**
   * Print subsection header
   */
  subsection(title: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.bold(`--- ${title} ---`));
    }
  }

  /**
   * Print list item
   */
  listItem(message: string, indent: number = 0): void {
    if (this.level <= LogLevel.INFO) {
      const spaces = ' '.repeat(indent);
      console.log(`${spaces}• ${message}`);
    }
  }

  /**
   * Print key-value pair
   */
  keyValue(key: string, value: string, indent: number = 0): void {
    if (this.level <= LogLevel.INFO) {
      const spaces = ' '.repeat(indent);
      console.log(`${spaces}${chalk.bold(key + ':')} ${value}`);
    }
  }

  /**
   * Print progress indicator (overwrites same line)
   */
  progress(current: number, total: number, message: string): void {
    if (this.level <= LogLevel.INFO) {
      const percentage = Math.round((current / total) * 100);
      const bar = this.progressBar(percentage);
      // Clear line and move cursor to start, then print
      process.stdout.write(`\r\x1b[K${bar} ${chalk.gray(`[${current}/${total}]`)} ${message}`);

      // Add newline on completion
      if (current === total) {
        process.stdout.write('\n');
      }
    }
  }

  /**
   * Generate progress bar
   */
  private progressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const filledBar = chalk.green('█'.repeat(filled));
    const emptyBar = chalk.gray('░'.repeat(empty));

    return `${filledBar}${emptyBar} ${chalk.cyan(`${percentage}%`)}`;
  }

  /**
   * Print skill installation detail with spinner/checkmark
   */
  skillProgress(skillName: string, status: 'installing' | 'completed' | 'skipped', dependencies?: string[]): void {
    if (this.level <= LogLevel.INFO) {
      const icon = status === 'installing'
        ? chalk.cyan('◐')
        : status === 'completed'
          ? chalk.green('✓')
          : chalk.yellow('○');

      let line = `  ${icon} ${chalk.bold(skillName)}`;

      if (dependencies && dependencies.length > 0) {
        line += chalk.gray(` → ${dependencies.join(', ')}`);
      }

      console.log(line);
    }
  }

  /**
   * Print table
   */
  table(headers: string[], rows: string[][]): void {
    if (this.level <= LogLevel.INFO) {
      // Calculate column widths
      const widths = headers.map((header, i) => {
        const columnValues = [header, ...rows.map(row => row[i] || '')];
        return Math.max(...columnValues.map(v => v.length));
      });

      // Print header
      const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
      console.log(chalk.bold(headerRow));
      console.log(widths.map(w => '─'.repeat(w)).join('─┼─'));

      // Print rows
      rows.forEach(row => {
        const rowStr = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' │ ');
        console.log(rowStr);
      });
    }
  }

  /**
   * Clear console
   */
  clear(): void {
    console.clear();
  }

  /**
   * Print empty line
   */
  newline(): void {
    if (this.level <= LogLevel.INFO) {
      console.log();
    }
  }

  /**
   * Print horizontal rule
   */
  hr(): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)));
    }
  }
}

// Export singleton instance
export const logger = new Logger();

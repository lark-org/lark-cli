import { Command } from 'commander'
import { AbstractAction } from '../actions/abstract.action'

export abstract class AbstractCommand {
  // eslint-disable-next-line no-useless-constructor
  constructor(protected action: AbstractAction) {}

  public abstract load(program: Command): void
}

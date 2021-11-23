import { Input } from '../utils/command.input'

export abstract class AbstractAction {
  public abstract handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[]
  ): Promise<void>
}

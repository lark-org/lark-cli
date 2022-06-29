/* eslint-disable arrow-body-style */

import { Choice } from 'prompts'

export const generateInput = (name: string, message: string) => {
  return (defaultAnswer: string): any => ({
    type: 'input',
    name,
    message,
    default: defaultAnswer
  })
}

export const generateSelect = (
  name: string,
  type = 'select'
): ((
  message: string
) => (choices: Choice[], validate?: (input: string) => boolean) => any) => {
  return (message: string, validate?: (input: string) => boolean) => {
    return (choices: Choice[]) => ({
      type,
      name,
      message,
      choices,
      validate
    })
  }
}

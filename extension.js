const vscode = require('vscode')

function activate(context) {
  const startedDebugSessionListener = vscode.debug.onDidStartDebugSession(() =>
    eventListener('onDidStartDebugSession'),
  )
  const terminatedDebugSessionListener = vscode.debug.onDidTerminateDebugSession(
    () => eventListener('onDidTerminateDebugSession'),
  )

  context.subscriptions.push(
    startedDebugSessionListener,
    terminatedDebugSessionListener,
  )
}

function eventListener(event) {
  // TODO: Copy JSON configuration and mutate properties
  // FIXME: Validate entire JSON configuration schema
  // Get last specified configuration
  let configurations = vscode.workspace
    .getConfiguration('events')
    .get('configurations')

  if (!Array.isArray(configurations)) {
    return // not valid
  }

  if (!configurations.length) {
    return // empty
  }

  configurations = configurations.filter(
    configuration => configuration.event === event,
  )

  if (!configurations.length) {
    return // not found
  }

  const configuration = configurations[configurations.length - 1]

  // Get last specified unique commands
  let commands = configuration.commands.reduce((commands, currentCommand) => {
    const index = commands.findIndex(
      command => command.command === currentCommand.command,
    )

    if (index >= 0) {
      commands[index] = {
        ...currentCommand,
        conditions: currentCommand.conditions.map(condition => ({
          ...condition,
        })),
      }
    } else {
      commands.push({
        ...currentCommand,
        conditions: currentCommand.conditions.map(condition => ({
          ...condition,
        })),
      })
    }

    return commands
  }, [])

  // Get commands with last specified unique conditions
  commands = commands.map(currentCommand => {
    const command = currentCommand.conditions.reduce(
      (command, currentCondition) => {
        const index = command.conditions.findIndex(
          condition =>
            condition.configuration === currentCondition.configuration,
        )

        if (index >= 0) {
          command.conditions[index] = { ...currentCondition }
        } else {
          command.conditions.push({ ...currentCondition })
        }

        return command
      },
      { ...currentCommand, conditions: [] },
    )

    return command
  })

  // Get commands with valid conditions (AND)
  commands = commands.reduce((commands, currentCommand) => {
    const isValid = currentCommand.conditions.every(condition => {
      const configuration = vscode.workspace
        .getConfiguration()
        .get(condition.configuration)

      if (configuration === undefined) {
        return false // invalid configuration
      }

      return configuration === condition.value
    })

    if (isValid) {
      commands.push(currentCommand.command)
    }

    return commands
  }, [])

  // Try to xecute each command
  if (commands.length) {
    commands.forEach(command => {
      vscode.commands
        .executeCommand(command)
        .then(() => undefined, error => console.error(error))
    })
  }
}

exports.activate = activate

module.exports = {
  activate,
}

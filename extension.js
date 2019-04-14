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
  // Get event configuration
  const configurations = vscode.workspace
    .getConfiguration('events')
    .get('configurations')
  const eventConfigurations = configurations.filter(
    configuration => configuration.event === event,
  )
  const configuration = eventConfigurations[eventConfigurations.length - 1]

  // Reduce commands to unique commands
  let reducedCommands = configuration.commands.reduce(
    (commands, currentCommand) => {
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
    },
    [],
  )

  // Reduce commands' conditions to unique conditions
  reducedCommands = reducedCommands.map(reducedCommand => {
    const command = reducedCommand.conditions.reduce(
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
      { ...reducedCommand, conditions: [] },
    )

    return command
  })

  // Reduce commands to commands with valid conditions
  reducedCommands = reducedCommands.reduce((commands, currentCommand) => {
    const isValid = currentCommand.conditions.every(condition => {
      const configuration = vscode.workspace
        .getConfiguration()
        .get(condition.configuration)

      if (configuration === undefined) {
        console.error('Invalid configuration')
      }

      return configuration === condition.value
    })

    if (isValid) {
      commands.push(currentCommand.command)
    }

    return commands
  }, [])

  // Execute each command
  if (reducedCommands.length) {
    reducedCommands.forEach(command => {
      vscode.commands.executeCommand(command)
    })
  }
}

exports.activate = activate

module.exports = {
  activate,
}

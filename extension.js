const vscode = require('vscode')

function activate(context) {
  const disposable = vscode.debug.onDidStartDebugSession(() => {
    // Get event configuration
    const configurations = vscode.workspace
      .getConfiguration('events')
      .get('configurations')
    const eventConfigurations = configurations.filter(
      configuration => configuration.event === 'onDidStartDebugSession',
    )
    const configuration = eventConfigurations[eventConfigurations.length - 1]

    // Reduce commands to unique commands
    let reducedCommands = configuration.commands.reduce(
      (accumulatedCommands, currentCommand) => {
        const index = accumulatedCommands.findIndex(
          command => command.command === currentCommand.command,
        )

        if (index === -1) {
          accumulatedCommands.push(currentCommand)
        } else {
          accumulatedCommands[index] = currentCommand
        }

        return accumulatedCommands
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

          if (index === -1) {
            command.conditions.push(currentCondition)
          } else {
            command.conditions[index] = currentCondition
          }

          return command
        },
        { command: reducedCommand.command, conditions: [] },
      )

      return command
    })

    // Reduce commands to commands with valid conditions
    reducedCommands = reducedCommands.reduce(
      (accumulatedCommands, currentCommand) => {
        const isValid = currentCommand.conditions.every(condition => {
          const workspaceConfiguration = vscode.workspace
            .getConfiguration()
            .get(condition.configuration)

          if (workspaceConfiguration === undefined) {
            console.error('Invalid configuration')
          }

          // FIXME: Add object type comparison as well
          return workspaceConfiguration === condition.value
        })

        if (isValid) {
          accumulatedCommands.push(currentCommand.command)
        }

        return accumulatedCommands
      },
      [],
    )

    // Execute each command
    if (reducedCommands.length) {
      reducedCommands.forEach(command => {
        vscode.commands.executeCommand(command)
      })
    }
  })

  context.subscriptions.push(disposable)
}

exports.activate = activate

module.exports = {
  activate,
}

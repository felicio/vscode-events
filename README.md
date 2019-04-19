# VS Code Events
Execution of commands on events emitted by Visual Studio Code

## About

Currently supported events:
- `onDidStartDebugSession`
- `onDidTerminateDebugSession`

## Usage (`settings.json`)

Conditionally toggle status bar visibilty on starting and stopping debugging:
```json
"events.configurations": [
  {
    "event": "onDidStartDebugSession",
    "commands": [
      {
        "command": "workbench.action.toggleStatusbarVisibility",
        "conditions": [
          {
            "configuration": "workbench.statusBar.visible",
            "value": false
          }
        ]
      }
    ]
  },
  {
    "event": "onDidTerminateDebugSession",
    "commands": [
      {
        "command": "workbench.action.toggleStatusbarVisibility",
        "conditions": [
          {
            "configuration": "workbench.statusBar.visible",
            "value": true
          }
        ]
      }
    ]
  }
]
```

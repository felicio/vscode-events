const vscode = require('vscode');

function activate(context) {
	const disposable = vscode.debug.onDidStartDebugSession(() => {
		const isVisible = vscode.workspace.getConfiguration('workbench.statusBar').get('visible')

		if (!isVisible) {
			vscode.commands.executeCommand('workbench.action.toggleStatusbarVisibility')
		}
	})

	context.subscriptions.push(disposable);
}

exports.activate = activate;

module.exports = {
	activate,
}

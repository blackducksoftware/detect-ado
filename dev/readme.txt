The 'commands' wrap the 'library' scripts so you can execute them from the command line. 
This way we can write future commands that do multiple tasks (like update detect cache before build).

Commands
	NodeJs files you can execute with 'node filename.js'.

Command Wrappers
	Several .cmd files exist that simply wrap the node.js files to allow for double clicking (easy running).

Available Commands:

	node update-cached-detect.js
		Use to update the cached version of detect -- writes to "tasks\detect-task\lib\detect.ps1"
	


Powershell Variables

	DETECT_LATEST_RELEASE_VERSION
	DETECT_USE_SNAPSHOT
	DETECT_JAR_PATH
	TMP
	DETECT_SKIP_JAVA_TEST
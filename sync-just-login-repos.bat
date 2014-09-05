@ CHOICE /C YN  /T 5 /D Y /M "Verbose"
@ IF ERRORLEVEL 2 (                    ::NOT VERBOSE
	ECHO just-login-client
	cd C:\Github\just-login-client
	git.exe pull --progress "origin"
	ECHO just-login-core
	cd C:\Github\just-login-core
	git.exe pull --progress "origin"
	ECHO just-login-emailer
	cd C:\Github\just-login-emailer
	git.exe pull --progress "origin"
	ECHO just-login-server-api
	cd C:\Github\just-login-server-api
	git.exe pull --progress "origin"
	ECHO just-login-example
	cd C:\Github\just-login-example
	git.exe pull --progress "origin"
) ELSE (                               ::VERBOSE
	cd C:\Github\just-login-client
	git.exe pull -v --progress "origin"
	cd C:\Github\just-login-core
	git.exe pull -v --progress "origin"
	cd C:\Github\just-login-emailer
	git.exe pull -v --progress "origin"
	cd C:\Github\just-login-server-api
	git.exe pull -v --progress "origin"
	cd C:\Github\just-login-example
	git.exe pull -v --progress "origin"
)
PAUSE
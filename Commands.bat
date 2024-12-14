@echo off

:main
cls
echo ------------------------------
echo Discord Bot Command Module
echo ------------------------------

:filename
echo Example: Hello.js 
set /p filename=Input File name:
echo -------
:cmdname
echo Example: hello
set /p cmdname=Input Command Name: 
echo -------
:description
echo Example: Saying hello to people
set /p description=Input Command Info: 
echo -------
:reply
echo Example: Hello everyone!
set /p reply=What should bot reply?: 
echo -------
:create_file
echo module.exports = { > "Commands\%filename%"
echo     name: '%cmdname%', >> "Commands\%filename%"
echo     description: '%description%', >> "Commands\%filename%"
echo     execute(message, args, client) { >> "Commands\%filename%"
echo         message.reply(`%reply%`); >> "Commands\%filename%"
echo     }, >> "Commands\%filename%"
echo }; >> "Commands\%filename%"

:success
cls
echo ------------------------------
echo Success!
echo Name: %filename%
echo New Command: %cmdname%
echo ------------------------------
pause
exit /b
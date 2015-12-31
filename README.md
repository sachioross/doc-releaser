# Doc Releaser

This simple utility was created to do help when technical documentation needs to be written in a very un-collaborative manner, such as via Word documents, and the best way to keep track of things is through a standardized file-naming convention. 

Example: for a file release on December 30th, 2015 at 6:07PM, the file name would be: 

201512301807-MyFile.txt

Using programs like word is very tedious to keep hitting save-all and then trying to find your most recent "release." This utility creates a **current** folder and a **previous** folder. The **current** folder will only contain the file created from the last time this utility was run. Each time this utility runs, it will move the file in the **current** folder into the **previous** folder.

### Processing steps

1. Ensure that a file name was specified in the command, exit process if not with a message
2. Look for a configuration file or use defaults if one not provided*
3. Find the **current** and **previous** folders or create if not existing
4. Move any files in the **current** folder to the **previous** folder
5. Copy the file specified in the command into the **current** folder with the proper file naming convention.

* = This is still a bit buggy and is being worked on

### Outstanding Tasks

- Proper handling for configuration file
- Current file will be moved, but not created, if file with same name (including timestamp) already exists in **previous** folder
- Add additional variables in the file naming
- Provide ability to specify variables and replacement functions
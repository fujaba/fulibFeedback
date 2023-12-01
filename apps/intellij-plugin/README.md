# fulibFeedback

This plugin allows grading code assignments with fulib.org.

## Setup

1. Install the plugin from the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/23254-fulibfeedback).
2. Go to "Settings > Tools > fulibFeedback" and enter your full name. This is required for the plugin to figure out who you are.
3. Open or create an Assignment on https://fulib.org/assignments
4. Configure the plugin for use with the assignment:
   1. Use the "Options > Configure fulibFeedback" action to configure the plugin automatically, **or**
   2. Fill the fields `API Server`, `Assignment ID` and `Assignment Token` in the IDE under "Settings > Tools > fulibFeedback".

## Usage

1. Open or clone a repository from GitHub Classroom.
2. Open a file from the repository.
3. fulibFeedback will automatically detect the assignment and solution and show a notification.
4. Start evaluation a task for a solution on fulib.org.
5. Select code in the IDE.
6. fulibFeedback will transfer the selection to fulib.org.

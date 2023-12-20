# MarkMaker Chrome Extension

![MarkMaker logo](/assets/MarkMakerLogo.png)

## Overview

MarkMaker is a Chrome extension that allows the use of Markdown in the LinkedIn "About Me" sections. Transform your LinkedIn profile into a dynamic space for showcasing your personality using Markdown! With MarkMaker, it's as simple as adding a special tag to your profile.

## Basic Usage

1. Append the following tag at the end of your LinkedIn profile's "About Me" section:
   `MarkMaker: <url>`
   Replace `<url>` with the URL for your raw-text Markdown file.

2. Fellow extension users will experience your profile in Markdown!

And example of it's use would be:

```
Here's some stuff that would be an a traditional LinkedIn
About Me section, including what my current projects are, education, etc.

MarkMaker: git@Sombody101
```

This will show my LinkedIn About Me section for people who don't have the extension installed, but would do the README.md file associated with [my profile](https://github.com/Sombody101).

## GitHub Integration

Display your GitHub README.md on LinkedIn with MarkMaker:
   `MarkMaker: git@<username>`
   MarkMaker adds your GitHub bio into your LinkedIn profile.
   The branch will default to `main` when not specified.

### Custom Branch

Specify a custom branch for your GitHub README.md:
   `MarkMaker: git@<branch_name>/<username>`
   For example:
   ```
   MarkMaker: git@master>SomeGithubUser
   ```

> [!TIP]
> "git@" is not case sensitive.

## Important Note

To ensure a smooth experience for all users, MarkMaker adopts a bottom-line approach to avoid displaying raw Markdown to those without the extension.

## Test Markdown File

Don't have a Markdown file but want to see the end result? Use the following tag:
   `MarkMaker: #test`
   This will provide you with an example Markdown file.

## Installation

Install MarkMaker now and enhance your LinkedIn profile with the power of Markdown!

> [!IMPORTANT]
> MarkMaker will NOT overwrite your "About Me" section on LinkedIn. Any changes made by this extension are temporary. MarkMaker replaces the HTML presented with a parsed Markdown file, styled like GitHub. For others to see your Markdown file, they need to have the extension installed as well.

---

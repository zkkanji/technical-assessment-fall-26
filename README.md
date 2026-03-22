# 🏎️ Impact Team Technical Assessment Fall 2026 🏎️

<img width="1365" height="512" alt="f1datalogo" src="https://github.com/user-attachments/assets/1c89f0e6-50c3-4efd-9366-3f85bee7f108" />

Congratulations on reaching the next step of the application process! This phase is the most important one in the entire process, as it assesses your ability to create a web app using both tools you're familiar with and ones you probably aren't and will have to pick up as you go. This is one of the most important skills for a web developer to cultivate.

By **Sunday, April 19th, 2026 at 11:59pm**, you must fork this repository and submit a PR (pull request) to this repository with both your completed version of the app and a screen recording of you walking me through your app's features.

# Your Task: The F1 Team Dashboard
I've recently gotten really into Formula 1, but don't know very much about the sport's history. I want to use this technical assessment as a chance for you to show me **all the data**!

For this assessment, you will be building a Single Page Application (SPA) centered around Formula One data! Pick your favorite F1 team (e.g., Ferrari, Red Bull, Mercedes) and build a dedicated data dashboard for them. You will need to query a Formula One API (such as the Ergast F1 API archive, OpenF1, or a similar free dataset) to populate your app.

# Core Requirements
Your app must include the following features:
- The application should run on a single page without needing to reload the browser when navigating between different components or views.
- An interesting and beautiful frontend design with a catchy title, apt description, and cool fonts and colors that looks good on any screen size. It probably makes sense for your frontend to be based around the theming of your favorite team, but don't let me hinder your creativity!
- Successfully fetch and render data from an external F1 API.
- Display your F1 data (e.g., race results, driver standings, lap times) in a table. The table should be capped at **20 rows per page.** Include functional Next/Previous arrows to navigate throughout the entire dataset. Also include a search bar that filters the dataset based on simple text input.
- Include at least one chart or graph (e.g., a bar chart of points, a line graph of lap times) that visualizes the data you pulled from the API. You can use libraries like Chart.js, Recharts, or D3.
- Include an animated background and add smooth transitions or animations to your UI elements as you see fit.
- Deploy the frontend and backend if you can using some of the free deployment tools we talked about in the workshops!

# Extra Features
If you want to go above and beyond, try implementing some or all of these features!
- Allow the user to change the number of rows displayed at once (e.g., a dropdown for 10, 20, or 50 rows) and add "Jump to Beginning" and "Jump to End" arrows.
- Support for Regex (Regular Expressions) in the search bar, add a custom UI for Boolean search logic (e.g., dropdowns or toggles allowing users to search "Driver A AND Track B", or "Team A OR Team B").

**If you don't finish everything on time, just submit what you have. Partial submissions will still be considered. Please try to give yourself adequate time to work on this project, though. Start it as early as you can!**

## Things to Consider
This task is tough and time-intensive! Try your best with it. I am really excited to see what you come up with. Please start working on it early, and budget your time well. I am going to be strict about the deadline.

I highly encourage you to take this opportunity to learn about and use web development tools that you are not familiar with. One of the most important skills as a web developer is to be able to understand and read documentation. Submissions that go beyond what we covered in JDT will be valued higher, but you must understand your code! You will be asked about it during your interview, if you reach that step.

I have a few pieces of advice for you:
- Don't skimp out on the frontend. I want your sites to look pretty, so really make an effort to give them a nice visual aesthetic. You are welcome to use a UI library such as [Material UI](https://mui.com/material-ui/all-components/).
- Feel free to use my technical assessment when I applied for Impact Team, [Dawn2Dusk](https://dawn2dusk.netlify.app/), as a model and a guide for you. It has some of the features we didn't cover in the JDT workshops, such as multiple pages, so feel free to copy my main.jsx code from there when working to implement that. You can access the code for it [here](https://github.com/nicolajack/dawn2dusk).
  
Most importantly, try your best to just make something you're proud of! **If you're unable to implement every feature of the site, that's okay, just submit whatever you have.** Please really try to give yourself the time you need to work on it, though.

## A Note on LLMs
You are welcome to use LLMs to help you with anything you need for this project. However, please make sure you understand any code produced by a LLM that you use, since I may be asking you about your code during the interview, if you are invited to it.

## Good Luck!
I'm really excited to see what you produce! Try your best with it and don't worry if you can't figure out everything. Submit whatever you have as a PR following the template in [pr_template.md](pr_template.md). I hope you enjoy working on this and feel proud enough of it to use it as a project or a demo of your abilities on your portfolio :)

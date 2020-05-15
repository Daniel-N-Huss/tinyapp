# TinyApp Project - A URL Shortening Service

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (like bit.ly).

## Final Product

!['Screenshot of the URL's page'](https://github.com/Daniel-N-Huss/tinyapp/blob/master/docs/urls-page.png?raw=true)

!["Screenshot of short URL page with edit bar and analytics"](https://github.com/Daniel-N-Huss/tinyapp/blob/master/docs/URL%20edit%20page%20with%20analytics.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- cookie-parser

## Getting Started

- Install all dependencies listed above (using `npm install` command)
- Run the development web server using the `node express_server.js` command

## Extra features

Along with the functionality of storing shortened links, method override route handling supports more HTML method verbs. 
Analytics have also been implemented based on cookie tracking. Users can see how many views each short link has recieved, how many of those views are unique, and a log of when those views happened.

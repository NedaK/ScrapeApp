# ScrapeApp - Reddit Scraper

 Whenever a user visits this site, and types in a subreddit to scrape, the app will scrape stories from that subreddit and display them for the user. Each scraped article is saved to a MongoDB application database. When articles are scraped they display the following:

     * Title - the title of the article

     * Subreddit - the subreddit the article is from

     * Link - the url to the original article or subreddit conversation

     

  Users can leave comments and a username on the articles displayed and revisit them later. The comments are saved to the database as well, and associated with their articles. Users can delete comments left on articles, and all stored comments are visible to every user.

  The default index page will display all articles already stored in the database.  Once the user scrapes for a specific subreddit, those articles will populate instead of all articles from the database.  If a user scrapes a subreddit more than once, articles with duplicate titles will not be added to the database, and an error will show up server side.  The error will not stop the app from running, and the user can change the subreddit search to continue on.
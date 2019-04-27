var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//add handlebars 
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/ScrapeAppDB", { useNewUrlParser: true });
//mongoose.connection.db.dropDatabase();


app.get("/", function(req, res) {

    
    db.Article.find({}).then(function(data) {
      var hbsObject = {
        articles: data
      };
     console.log(hbsObject);
      res.render("index", hbsObject);
    });
  });

  app.get("/scrape/:subreddit", function(req, res) {
      var subreddit = req.params.subreddit;
    // First, we grab the body of the html with axios
    axios.get("https://old.reddit.com/r/"+ subreddit).then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("div.thing").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .find("a.title")
          .text();
        result.link = $(this)
          .attr("data-url");
          result.subreddit = $(this).attr("data-subreddit");

          if(/^\/r\//.test(result.link)){
              result.link = "https://old.reddit.com" + result.link;
          }
        
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      //return res.json("/");
      res.send("Scrape Complete");
    });
  });

  app.post("/articles/:articleID", function(req, res){
    var article_id = req.params.articleID;
    db.Comment.create(req.body).
        then(function(result){
            console.log(result);
       return db.Article.findOneAndUpdate({_id:article_id}, { $push: { comment: result._id } }, { new: true }).then(function(response){
            res.json(response);
          });
    });

  });


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });


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

//If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/ScrapeAppDB";

mongoose.connect(MONGODB_URI);

// Connect to the Mongo DB - locally
//mongoose.connect("mongodb://localhost/ScrapeAppDB", { useNewUrlParser: true });



app.get("/", function(req, res) {

    //default landing page shows all articles in DB
    db.Article.find({}).populate("comment").then(function(data) {
      var hbsObject = {
        articles: data
      };
     //console.log(hbsObject);
      res.render("index", hbsObject);
    });
  });

  app.get("/:subreddit", function(req, res){
      var subreddit = req.params.subreddit;
      console.log("Im in the right route! " + req.params.subreddit);
      db.Article.find({subreddit:subreddit}).populate("comment").then(function(data) {
          console.log(data);
        var hbsObject = {
          articles: data
        };
       //console.log(hbsObject);
        res.render("index", hbsObject);
      });
      
  })

  app.get("/scrape/:subreddit", function(req, res) {
      var subreddit = req.params.subreddit;
      console.log(subreddit);
    // First, we grab the body of the html with axios
    axios.get("https://old.reddit.com/r/"+ subreddit).then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      var count = $("div.thing").length;
    
      var articleArray = [];

      $("div.thing").each(function(i, element) {
        // Save an empty result object
        var result = {};
        
        // Add the title, link, and subreddit of every result, and save them as properties of the result object
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
            
            //console.log(dbArticle);
             articleArray.push(dbArticle);
            // console.log("Articlearray: " + articleArray.length);
            // console.log("Count: " + count);
            
            if (articleArray.length === count) {
                // this will be executed at the end of the loop
                console.log('Did things to every .element, all done.');
                
                // var hbsObj = {
                //     articles: articleArray
                // }
                 res.json({status: "Success", redirect: '/'+subreddit});
                
            }
            
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });  

        });

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

  app.get("/articles/:articleID", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.articleID })
      .populate("comment")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get("/comments/:commentID", function(req, res){
      var comment_id = req.params.commentID;
      db.Comment.deleteOne({_id: comment_id}, function(err) {
        if(err){
            console.error(err);
        }
        res.redirect("/");
      });
      
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });


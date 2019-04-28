
$(document).ready(function(){


    $(document).on("click", "#scrape", function(e) {
        e.preventDefault();
        //$(".articles").empty();
        
        var subreddit = $("#subreddit").val().trim();
        console.log(subreddit);
        // Now make an ajax call for the Article
        $.ajax({
        method: "GET",
        url: "/scrape/" + subreddit
             }).success(function(response){
        
                //redirect with scraped articles 
        if (response.status === "Success") {
            window.location = response.redirect;
        }
            
            
        });
    });


    $(document).on("click", "#add-comment", function(){
        var article_id = $(this).attr("data-id");
        var username = $("#username_"+article_id).val();
        var comment = $("#comment_"+article_id).val();
        

        console.log(article_id);
        console.log(comment);
        console.log(username);

        $.ajax({
            method: "POST",
            url: "/articles/" + article_id,
            data: {
              
              username: username,
              comment: comment
            }
          })
            .then(function(data) {
              // Log the response
              console.log(data);
              window.location.reload();
              // Empty sections
              $("#comment").empty();
              $("#username").empty();
            });
    });

    $(document).on("click", "#delete", function(e){
        var comment_id = $(this).attr("data-id");
        console.log(comment_id);

        $.ajax({
            method: "GET",
            url: "/comments/" + comment_id
        }).then(function(response){
            window.location.reload();
           // response.redirect("/");
        });
    });

});


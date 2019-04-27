
$(document).ready(function(){


    $(document).on("click", "#scrape", function(e) {
        e.preventDefault();
        $(".articles").empty();
        
        var subreddit = $("#subreddit").val().trim();
        console.log(subreddit);
        // Now make an ajax call for the Article
        $.ajax({
        method: "GET",
        url: "/scrape/" + subreddit
        }).then(function(response){
            window.location.reload();

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
              // Empty the notes section
              $("#comment").empty();
              $("#username").empty();
            });
    })

});


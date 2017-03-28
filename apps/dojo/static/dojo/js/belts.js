$(document).ready(function(){
  $("#questionList").css({'height': $(window).height() - ($("#allTables").height() + 58)}); // this calculates the window size, then sets the questionList height to that minus the allTables div size plus some extra for padding, borders, etc. this makes the questions scrollable but not the main page
  $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("leagueScrollTop")); // scroll positions for DB windows loaded from sessionStorage, then cleared
  $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("leagueScrollLeft"));
  $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("teamScrollTop"));
  $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("teamScrollLeft"));
  $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("playerScrollTop"));
  $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("playerScrollLeft"));
  $("#questionList").scrollTop(sessionStorage.getItem("questionListScrollTop"));
  $("#questionList").scrollLeft(sessionStorage.getItem("questionListScrollLeft"));
  sessionStorage.clear();
  $("#resetAnswers").click(function(){
    $.get("/clearsession", function(){
      location.reload(true); // putting true reloads page from server instead of cache. no parameter defaults fo false which loads from cache
    })
  })
  $(".answerButton").click(function(){
    $.get("/check", {"questionNumber": $(this).attr("name"), "response": $("textarea[name=" + $(this).attr("name") + "]").val(), "beltcolor": $("#beltcolor").attr("name")}, function(results){
      $("#" + results["div"]).find(".resultsWindow").html(results["resultsWindow"]);
      if(results["smiley"]){ // check if there's a smiley in the results that needs to be rendered
        $("#" + results["div"]).find(".smiley").html("<img src='/static/dojo/images/smiley.png' alt='smiley'>");
      } else { // if smiley not present in response, delete it from the smiley div because wrong answer was submitted
        $("#" + results["div"]).find(".smiley").html("");
      }
    });
  })
  $(window).on('beforeunload', function(){ // this will save the position of the database scrollwindows before a page refresh
    sessionStorage.setItem("leagueScrollTop", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("leagueScrollLeft", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("teamScrollTop", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("teamScrollLeft", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("playerScrollTop", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("playerScrollLeft", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("questionListScrollTop", $("#questionList").scrollTop());
    sessionStorage.setItem("questionListScrollLeft", $("#questionList").scrollLeft());
  })
  $(window).resize(function(){
    $("#questionList").css({'height': $(window).height() - ($("#allTables").height() + 58)});
  })
})

/*  answerButtons are jquery AJAX becuase I don't want a page refresh just to update the one answer div
    resetDB and resetAnswers could have been just forms that submit to django since the page needs to be reloaded after those anyway. However, I found that a page reload
    by doing a redirect("/") in views.py will always go to the top of the page whereas a page reload here with location.reload() will keep the current window positions
*/

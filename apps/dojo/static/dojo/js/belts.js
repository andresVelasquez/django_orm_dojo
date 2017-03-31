$(document).ready(function(){
  $("#questionList").css({'height': $(window).height() - ($("#allTables").height() + 58)}); // this calculates the window size, then sets the questionList height to that minus the allTables div size plus some extra for padding, borders, etc. this makes the questions scrollable but not the main page
  setScroll();
  $("#resetAnswers").click(function(){
    $.get("/clearsession", function(){
      setScrollZero();
      sessionStorage.clear(); // delete table scroll position data if answers are reset
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
    saveScroll();
  })
  $(window).resize(function(){
    $("#questionList").css({'height': $(window).height() - ($("#allTables").height() + 58)});
  })
})

/*  answerButtons are jquery AJAX because I don't want a page refresh just to update the one answer div
    resetDB and resetAnswers could have been just forms that submit to django since the page needs to be reloaded after those anyway. However, I found that a page reload
    by doing a redirect("/") in views.py will always go to the top of the page whereas a page reload here with location.reload() will keep the current window positions
*/

function saveScroll(){
  if (window.location.pathname == "/belt/yellow") {
    sessionStorage.setItem("lTopYellow", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftYellow", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopYellow", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftYellow", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopYellow", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftYellow", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("qTopYellow", $("#questionList").scrollTop());
    sessionStorage.setItem("qLeftYellow", $("#questionList").scrollLeft());
  } else if (window.location.pathname == "/belt/red") {
    sessionStorage.setItem("lTopRed", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftRed", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopRed", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftRed", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopRed", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftRed", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("qTopRed", $("#questionList").scrollTop());
    sessionStorage.setItem("qLeftRed", $("#questionList").scrollLeft());
  } else if (window.location.pathname == "/belt/black") {
    sessionStorage.setItem("lTopBlack", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftBlack", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopBlack", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftBlack", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopBlack", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftBlack", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("qTopBlack", $("#questionList").scrollTop());
    sessionStorage.setItem("qLeftBlack", $("#questionList").scrollLeft());
  }
}

function setScroll(){
  if (window.location.pathname == "/belt/yellow"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopYellow"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftYellow"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopYellow"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftYellow"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopYellow"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftYellow"));
    $("#questionList").scrollTop(sessionStorage.getItem("qTopYellow"));
    $("#questionList").scrollLeft(sessionStorage.getItem("qLeftYellow"));
  } else if (window.location.pathname == "/belt/red"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopRed"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftRed"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopRed"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftRed"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopRed"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftRed"));
    $("#questionList").scrollTop(sessionStorage.getItem("qTopRed"));
    $("#questionList").scrollLeft(sessionStorage.getItem("qLeftRed"));
  } else if (window.location.pathname == "/belt/black"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopBlack"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftBlack"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopBlack"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftBlack"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopBlack"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftBlack"));
    $("#questionList").scrollTop(sessionStorage.getItem("qTopBlack"));
    $("#questionList").scrollLeft(sessionStorage.getItem("qLeftBlack"));
  }
}

function setScrollZero(){ // I want all the scroll positions to be deleted when the resetAnswers button is clicked. That function does indeed clear the scroll position data in sessionStorage. However, the "beforeunload" method will re-save the data for the current page so it gets put back after the page refresh. So, reset the current page scroll positions to 0 manually when the resetAnswers is clicked
  $("#leagueDiv").find(".table-container").scrollTop(0); // scroll positions for DB windows loaded from sessionStorage, then cleared
  $("#leagueDiv").find(".table-container").scrollLeft(0);
  $("#teamDiv").find(".table-container").scrollTop(0);
  $("#teamDiv").find(".table-container").scrollLeft(0);
  $("#playerDiv").find(".table-container").scrollTop(0);
  $("#playerDiv").find(".table-container").scrollLeft(0);
  $("#questionList").scrollTop(0);
  $("#questionList").scrollLeft(0);
}

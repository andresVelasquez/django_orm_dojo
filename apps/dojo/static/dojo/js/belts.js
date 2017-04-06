$(document).ready(function(){
  setScroll();
  $("#resetAnswers").click(function(){
    $.get("/clearsession", function(){
      setScrollZero();
      sessionStorage.clear(); // delete table scroll position data if answers are reset
      location.reload(true); // putting true reloads page from server instead of cache. no parameter defaults fo false which loads from cache
    })
  })
  $(".answerButton").click(function(){ // lister on submit button to run check function
    check($(this));
  })
  $(".answerBox").keypress(function(event) { // listener on keypresses in the answerbox to look for the Enter key which will then call the check function
    if(event.which == '13') { // event code 13 is the Enter key so I intercept this and instead of doing a line break in the textarea, it will call the check function passing the textarea obect as an argument
      check($(this));
      return false; // returning false here disables the line break that would happen after the check function returns
    }
  });
  function check(thisObject){ // this will get either button object or textarea object which is fine because they both have a "name" property equal to the question number which is the attribute that is looked at
    $.get("/check", {"questionNumber": thisObject.attr("name"), "response": $("textarea[name=" + thisObject.attr("name") + "]").val(), "beltcolor": $("#beltcolor").attr("name")}, function(results){
      $("#" + results["div"]).find(".resultsWindow").html(results["resultsWindow"]);
      if(results["smiley"]){ // check if there's a smiley in the results that needs to be rendered
        $("#" + results["div"]).find(".smiley").html("<img src='/static/dojo/images/smiley.png' alt='smiley'>");
        $("#" + results["div"]).find(".hintButton").addClass("hideHintButton"); // hide hint button after right answer is given
      } else { // if smiley not present in response, delete it from the smiley div because wrong answer was submitted
        $("#" + results["div"]).find(".smiley").html("");
        $("#" + results["div"]).find(".hintButton").removeClass("hideHintButton"); // show hint button if incorrect answer is given
      }
    });
  }
  $('.hintButton').click(function(){
    $("#" + $(this).attr("name")).find(".resultsWindow").html("<h2 style='color: #9542f4'>Hint</h2><p class='leftJ'>" + $(this).attr("data") + "</p>");
  })
  $(window).on('beforeunload', function(){ // this will save the position of the database scrollwindows before a page refresh
    saveScroll();
  })
})

/*  answerButtons are jquery AJAX because I don't want a page refresh just to update the one answer div
    resetDB and resetAnswers could have been just forms that submit to django since the page needs to be reloaded after those anyway. However, I found that a page reload
    by doing a redirect("/") in views.py will always go to the top of the page whereas a page reload here with location.reload() will keep the current window positions
*/

function saveScroll(){ // saves scroll positions of tables and main page before page is refreshed
  if (window.location.pathname == "/belt/yellow") {
    sessionStorage.setItem("lTopYellow", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftYellow", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopYellow", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftYellow", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopYellow", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftYellow", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("mTopYellow", $("body").scrollTop());
    sessionStorage.setItem("mLeftYellow", $("body").scrollLeft());
  } else if (window.location.pathname == "/belt/red") {
    sessionStorage.setItem("lTopRed", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftRed", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopRed", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftRed", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopRed", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftRed", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("mTopRed", $("body").scrollTop());
    sessionStorage.setItem("mLeftRed", $("body").scrollLeft());
  } else if (window.location.pathname == "/belt/black") {
    sessionStorage.setItem("lTopBlack", $("#leagueDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("lLeftBlack", $("#leagueDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("tTopBlack", $("#teamDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("tLeftBlack", $("#teamDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("pTopBlack", $("#playerDiv").find(".table-container").scrollTop());
    sessionStorage.setItem("pLeftBlack", $("#playerDiv").find(".table-container").scrollLeft());
    sessionStorage.setItem("mTopBlack", $("body").scrollTop());
    sessionStorage.setItem("mLeftBlack", $("body").scrollLeft());
  }
}

function setScroll(){ // restores scroll positions after document is ready
  if (window.location.pathname == "/belt/yellow"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopYellow"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftYellow"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopYellow"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftYellow"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopYellow"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftYellow"));
    $("body").scrollTop(sessionStorage.getItem("mTopYellow"));
    $("body").scrollLeft(sessionStorage.getItem("mLeftYellow"));
  } else if (window.location.pathname == "/belt/red"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopRed"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftRed"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopRed"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftRed"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopRed"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftRed"));
    $("body").scrollTop(sessionStorage.getItem("mTopRed"));
    $("body").scrollLeft(sessionStorage.getItem("mLeftRed"));
  } else if (window.location.pathname == "/belt/black"){
    $("#leagueDiv").find(".table-container").scrollTop(sessionStorage.getItem("lTopBlack"));
    $("#leagueDiv").find(".table-container").scrollLeft(sessionStorage.getItem("lLeftBlack"));
    $("#teamDiv").find(".table-container").scrollTop(sessionStorage.getItem("tTopBlack"));
    $("#teamDiv").find(".table-container").scrollLeft(sessionStorage.getItem("tLeftBlack"));
    $("#playerDiv").find(".table-container").scrollTop(sessionStorage.getItem("pTopBlack"));
    $("#playerDiv").find(".table-container").scrollLeft(sessionStorage.getItem("pLeftBlack"));
    $("body").scrollTop(sessionStorage.getItem("mTopBlack"));
    $("body").scrollLeft(sessionStorage.getItem("mLeftBlack"));
  }
}

function setScrollZero(){ // I want all the scroll positions to be deleted when the resetAnswers button is clicked. That function does indeed clear the scroll position data in sessionStorage. However, the "beforeunload" method will re-save the data for the current page so it gets put back after the page refresh. So, reset the current page scroll positions to 0 manually when the resetAnswers is clicked
  $("#leagueDiv").find(".table-container").scrollTop(0);
  $("#leagueDiv").find(".table-container").scrollLeft(0);
  $("#teamDiv").find(".table-container").scrollTop(0);
  $("#teamDiv").find(".table-container").scrollLeft(0);
  $("#playerDiv").find(".table-container").scrollTop(0);
  $("#playerDiv").find(".table-container").scrollLeft(0);
  $("body").scrollTop(0);
  $("body").scrollLeft(0);
}

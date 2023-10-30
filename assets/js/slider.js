$(function(){
  $(".slideshow-zoom li").css({"position":"relative"});
  $(".slideshow-zoom li").hide().css({"position":"absolute","top":0,"left":0});
  setInterval(function(){
    var $active = $(".slideshow-zoom li.zoom");
    var $next = $active.next("li").length?$active.next("li"):$(".slideshow-zoom li:first");
    $active.fadeOut(2000).removeClass("zoom");
    $next.fadeIn(2000).addClass("zoom");
  },2000);
});

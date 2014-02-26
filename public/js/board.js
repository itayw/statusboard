/* Author:
 Supersteil
 http://supersteil.com
 */

function functions(){


  $(window).resize(onResize).resize();

  //refresh_google_analytics(true);
  //refresh_birthdays();
  refresh_twitter();
  setTimeout(function() {refresh_basecamp_projects(true);}, 000);

  update_clock(); // let clock set it's own timeout, so it runs each minute
  update_eta(new Date(2014,3,1)); // let clock set it's own timeout, so it runs each minute

  //setInterval('refresh_google_analytics(false)', 1200000); // 20 min
  //setInterval(refresh_birthdays, 1800000); // 30 min
  //setInterval(refresh_twitter, 600000); // 10 min
  setInterval('refresh_basecamp_projects(false)', 1800000); // 30 min
}

function onResize(){
  $size = ($(window).width() < 1280 ? 1280 : $(window).width()) / 1920;
  $margin = (1920-($size * 1920))/-2;
  $('body').css({
    '-webkit-transform':'translate('+$margin+'px,0px) scale('+$size+')', '-moz-transform':'translate('+$margin+'px,0px) scale('+$size+')'
  })
}
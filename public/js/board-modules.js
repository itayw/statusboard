/* CLOCK */

function update_eta(expectedDate) {
  var now = new Date(expectedDate);
  var currentHours = now.getHours();
  var currentMinutes = now.getMinutes();
  var currentSeconds = now.getSeconds();
  var currentWeekday = now.getDay();
  var currentDay = now.getDate()
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  var days_array = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  currentDay_txt = days_array[currentWeekday];

  var months_array = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  currentMonth = months_array[currentMonth];

  var currentHours12 = currentHours;
  if (currentHours12 > 12) {
    currentHours12 -= 12;
  }

  currentDay = ( currentDay < 10 ? "0" : "" ) + currentDay;
  currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;
  currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
  currentHours12 = ( currentHours12 < 10 ? "0" : "" ) + currentHours12;

  var currentDate = new Date();

  $.ajax('/targetDate', {
    type: 'GET',
    data: {
      detailed: true
    },
    crossDomain: true,
    success: function (milestone) {
      console.log(milestone);
      $('#eta_days').countdown(new Date(milestone.due_on), function (event) {
        $this = $(this);
        switch (event.type) {
          case "seconds":
          case "minutes":
          case "hours":
          case "days":
          case "weeks":
          case "daysLeft":
            $('#eta_' + event.type).html(event.value);
            break;
          case "finished":
            $this.fadeTo('slow', .5);
            break;
        }
      });
    }
  });
  //$('#eta_date_hours24').html(currentHours);
  // $('#eta_date_hours12').html(currentHours12);
  //$('#eta_date_minutes').html(currentMinutes);

  $('#eta_date_weekday').html(currentDay_txt);
  $('#eta_date_day').html(currentDay);
  $('#eta_date_month').html(currentMonth);
  $('#eta_date_year').html(currentYear);

  // set timeout for next run.
  var timeout = 60 * 1000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  setTimeout(update_clock, timeout);
}

function update_clock() {
  var now = new Date();
  var currentHours = now.getHours();
  var currentMinutes = now.getMinutes();
  var currentSeconds = now.getSeconds();
  var currentWeekday = now.getDay();
  var currentDay = now.getDate()
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  var days_array = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  currentDay_txt = days_array[currentWeekday];

  var months_array = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  currentMonth = months_array[currentMonth];

  var currentHours12 = currentHours;
  if (currentHours12 > 12) {
    currentHours12 -= 12;
  }

  currentDay = ( currentDay < 10 ? "0" : "" ) + currentDay;
  currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;
  currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
  currentHours12 = ( currentHours12 < 10 ? "0" : "" ) + currentHours12;

  $('#date_hours24').html(currentHours);
  $('#date_hours12').html(currentHours12);
  $('#date_minutes').html(currentMinutes);

  $('#date_weekday').html(currentDay_txt);
  $('#date_day').html(currentDay);
  $('#date_month').html(currentMonth);
  $('#date_year').html(currentYear);

  // set timeout for next run.
  var timeout = 60 * 1000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  setTimeout(update_clock, timeout);
}


/* BASECAMP */

function refresh_basecamp_projects(animate) {
  $.ajax('/buildTable', {
    type: 'GET',
    data: {
      detailed: true
    },
    crossDomain: true,
    success: function (projects) {
      $('#basecamp-projects').empty();
      var projectsTemplate = _.template($('#template-projects').html());

      $.each(projects, function (i, project) {
        if (project.deadline) {
          project.deadline = new XDate(project.deadline);
        }
      });
      $(projectsTemplate({
        projects: projects
      })).appendTo('#basecamp-projects');
      basecamp_animation(animate);
    }
  });
}

function basecamp_animation($boolean) {
  var $speed = 0;
  if ($boolean) {
    $speed = 400;
  }  ;

  $('.basecamp_project').css({
    opacity: '1'
  });
  $('.timeline figure').each(function () {
    $(this).stop().animate({
      width: $(this).attr('state') + '%'
    }, $speed, 'easeInOutQuad');
  })
}


/* GOOGLE ANALYTICS */

function refresh_google_analytics(animate) {
  $.ajax({
    url: 'api/google-analytics/stats.php',
    crossDomain: true,
    success: function (data) {
      if (data.stats !== undefined) {
        $.each(data.stats, function (i, stat) {
          stat.date = new XDate(stat.date);
        });

        var analyticsTemplate = _.template($('#template-analytics').html());
        $('.google_analytics_holder').empty().append(analyticsTemplate(data));
        google_analytics_animation(animate);
      }
    },
    error: function (data) {
      $('.google_analytics_holder').attr({'max': 0});
    }
  });
}

function google_analytics_animation($boolean) {
  $('.google_analytics_holder article:nth-child(2) .a_day').attr({
    state: 'active'
  });
  $('.google_analytics_holder article .slider').each(function () {
    var $new_val = parseInt($(this).parent().find('p').html());
    var $val = parseInt($(this).parent().parent().attr('max'));
    if ($new_val > $val) {
      $(this).parent().parent().attr({
        max: $new_val
      });
    }
  });

  $('.google_analytics_holder article .slider').each(function () {
    var $max = $(this).parent().parent().attr('max');
    var $width = parseInt($(this).parent().find('p').html());
    var $w = ($width / $max) * 460;
    var $speed = 0;
    if ($boolean) {
      $speed = 400;
    }
    ;
    $(this).stop().animate({
      width: $w
    }, $speed, 'easeInOutQuad');
  });
}


/* TWITTER */

function refresh_twitter() {
  socket.on('payload', function (data) {
    console.log(data);
    var tweetTemplate = _.template($('#template-tweet').html());
    $(tweetTemplate({
      data:data
    })).prependTo('#twitter_feed');

  });

  /*
  $.ajax({
    url: 'api/twitter/latest.php',
    crossDomain: true,
    success: function (tweet) {
      var tweetTemplate = _.template($('#template-tweet').html());
      var tweetHtml = tweetTemplate(tweet);
      tweetHtml = tweetHtml.replace(/([#]+[A-Za-z0-9-_]+)/g, '<span class="tweet_hashtag">$1</span>');
      tweetHtml = tweetHtml.replace(/([@]+[A-Za-z0-9-_]+)/g, '<span class="tweet_mention">$1</span>');
      $('#twitter_feed').empty().append(tweetHtml);
    },
  });*/
}
// ==UserScript==
// @name          New Filtered Netflix
// @namespace     http://www.netflix.com/
// @author        Nigel Fish | http://nigelfish.com/
// @license       Creative Commons BY-NC-SA
// @version       0.5
// @description   A replacement for the filtered Netflix of the past. I got around the now lack of Netflix API by checking the boxes that popup and looking for a rating, and then saving the info into localStorage. Thus, it will not filter things until you've hovered over them once.
// @homepage      https://github.com/dphrag/new-filtered-netflix
// @encoding      utf-8
// @match         http://*.netflix.com/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @run-at        document-end
// ==/UserScript==

// @chebee7i
//   - Add a "Watched" checkbox.
//   - Previously rated movies that are not yet tracked are declared as
//     watched once you hover over them.
//   - The status of any tracked movie can be overridden using the checkbox.
//   - Whenever a movie rating is provided, the movie is declared as watched
//     if it was not being tracked already. Otherwise, the status of the movie
//     remains unchanged.

$(document).ready(function() {

  var titles = JSON.parse(localStorage.getItem("filteredTitlesYo"));

  function addCheckbox(container) {
    var content = container.find('.bobMovieContent');
    var cb = $('<input />', { type: 'checkbox', id: 'watchedYo', value: 'watched' }).appendTo(content);
    $('<label />', { 'for': 'watchedYo', text: 'Watched' }).appendTo(content);

    var bobTitle = container.find('.bobMovieHeader .title').html();
    if (bobTitle != undefined) bobTitle = bobTitle.trim();
    cb.click(function () {
      if ( $(this).is(':checked') ) {
        titles[bobTitle] = true;
        hideThatTitleYo(bobTitle);
      }
      else {
        titles[bobTitle] = false;
        unhideThatTitleYo(bobTitle);
      }
      localStorage.setItem("filteredTitlesYo", JSON.stringify(titles));
    });

  }

  function hideThatTitleYo(title) {
    var selector = 'img[alt="' + title + '"]';
    $(selector).css({
      '-webkit-filter': 'grayscale(100%)',
      '-moz-filter': 'grayscale(100%)',
      '-o-filter': 'grayscale(100%)',
      '-ms-filter': 'grayscale(100%)',
      'filter': 'grayscale(100%)',
      'opacity': '0.4'
    });
  }

  function unhideThatTitleYo(title) {
    var selector = 'img[alt="' + title + '"]';
    $(selector).css({
      '-webkit-filter': 'grayscale(0%)',
      '-moz-filter': 'grayscale(0%)',
      '-o-filter': 'grayscale(0%)',
      '-ms-filter': 'grayscale(0%)',
      'filter': 'grayscale(0%)',
      'opacity': '1'
    });
  }

  if (titles === null) {
    titles = {};
  } else {
    //loop and hide
    for (var key in titles) {
      if (titles[key]) {
        // hide only if marked as watched
        hideThatTitleYo(key);
      }
    }
  }
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  // create an observer instance
  var observerBobMovie = new MutationObserver(function(mutations) {
    var bobContent = $('.bobContent');
    var bobTitle = bobContent.find('.bobMovieHeader .title').html();
    if (bobTitle != undefined) bobTitle = bobTitle.trim();

    var stars = bobContent.find('.strbrContainer');
    stars.on("click", function () {
      if (!(bobTitle in titles)) {
        titles[bobTitle] = true;
        bobContent.find('#watchedYo').prop('checked', true);
        localStorage.setItem("filteredTitlesYo", JSON.stringify(titles));
        hideThatTitleYo(bobTitle);
      }
    });

    // add checkbox to manually mark as watched
    addCheckbox(bobContent);

    if (titles[bobTitle] === true) {
      bobContent.find('#watchedYo').prop('checked', true);
    }
    else if (titles[bobTitle] === false) {
      // if explicitly declared as unwatched, then leave it unchecked
      bobContent.find('#watchedYo').prop('checked', false);
    }
    else if (bobContent.find('.sbmfrt').length != 0) {
      // otherwise, if movie has rating, store locally that it was watched and shade image
      titles[bobTitle] = true;
      bobContent.find('#watchedYo').prop('checked', true);
      localStorage.setItem("filteredTitlesYo", JSON.stringify(titles));
      hideThatTitleYo(bobTitle);
    }
  });

  var observerBobContainer = new MutationObserver(function(mutations) {
    var bobContent = $('#bob');
    var bobTitle = bobContent.find('.bob-header .title').html();
    if (bobTitle != undefined) bobTitle = bobTitle.trim();
    //check if movie watched
    if (bobContent.find('.starbar').data('your-rating') != "") {
      //store locally that it was watched and shade image
      titles[bobTitle] = true;
      localStorage.setItem("filteredTitlesYo", JSON.stringify(titles));
      hideThatTitleYo(bobTitle);
    }
  });

  var observerGallery = new MutationObserver(function(mutations) {
    for (var key in titles) {
      hideThatTitleYo(key);
    }
  });

  // pass in the target node, as well as the observer options
  if ($('#BobMovie').length) observerBobMovie.observe(document.querySelector('#BobMovie'), {
    attributes: true
  });
  if ($('#bob-container').length) observerBobContainer.observe(document.querySelector('#bob-container'), {
    attributes: true,
    childList: true
  });

  //Also check for when new images appear and hide
  if ($('.gallery').length) observerGallery.observe(document.querySelector('.gallery'), {
    childList: true
  });

  if ($('#page-WiAgain').length) {
    //just add everything on this page
    $('img.boxShotImg').each(function(index) {
      var imgTitle = $(this).attr('alt').trim();
      titles[imgTitle] = true;
      hideThatTitleYo(imgTitle);
    });
    localStorage.setItem("filteredTitlesYo", JSON.stringify(titles));

  }

});

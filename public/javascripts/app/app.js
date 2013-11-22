/* global document, sendAjaxRequest, window */
//io was up there too; don't plan to use sockets.

$(document).ready(initialize);
var lat;
var lng;
// var socket;

function initialize(){
  $(document).foundation();
  // initializeSocketIO();
  $('#authentication-button').on('click', clickAuthenticationButton);
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#musiciansIndexPage #createProfileButton').on('click', clickCreateMusicianProfile);
  $('#musiciansIndexPage #profileForm h5').on('click', clickProfileSubheader);
  $('#musiciansIndexPage #profileForm').on('submit', clickSaveProfile);
  $('#musiciansIndexPage #profileForm #addGenreButton').on('click', clickAddGenre);
  $('#musiciansIndexPage #profileForm #cancelProfile').on('click', clickCancelProfileSubmit);
  $('#musiciansIndexPage #ViewMyProfileLink').on('click', clickViewMusicianProfile);
  $('#musiciansIndexPage .musician a').on('click', clickMusicianLink);
  initMap(lat, lng, 13);
}

// function initializeSocketIO(){
//   var port = window.location.port ? window.location.port : '80';
//   var url = window.location.protocol + '//' + window.location.hostname + ':' + port + '/app';

//   socket = io.connect(url);
//   socket.on('connected', socketConnected);
// }

// function socketConnected(data){
//   console.log(data);
// }

function initMap(lat, lng, zoom){
  var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var latLng = new google.maps.LatLng(lat, lng);
  new google.maps.Marker({map: map, position: latLng});
}

//-------------------------------------------------------------------//
//-------------------------Click Handlers----------------------------//
//-------------------------------------------------------------------//


function clickRegister(e){
  var url = '/users';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', null, e, function(data){
    htmlRegisterComplete(data);
  });
}

function clickLogin(e){
  var url = '/login';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdateLoginStatus(data);
  });
}

function clickAuthenticationButton(e){
  var isAnonymous = $('#authentication-button[data-email="anonymous"]').length === 1;

  if(isAnonymous){
    $('form#authentication').toggleClass('hidden');
    $('input[name="email"]').focus();
  } else {
    var url = '/logout';
    sendAjaxRequest(url, {}, 'post', 'delete', null, function(data){
      htmlLogout(data);
    });
  }
  e.preventDefault();
}

//-------------------------------------------------------------------//
//-------------Musicians Index Page Click Handlers-------------------//
//-------------------------------------------------------------------//
function clickCreateMusicianProfile(){
  $('#musiciansIndexPage #profileForm').removeClass('hidden');
}

function clickProfileSubheader(){
  var $subheader = $(this);
  $subheader.next().toggleClass('hidden');
}

function clickAddGenre(){
  var genre = $('#AddNewGenre').val();
  var data = {name: genre};
  sendAjaxRequest('/genres', data, 'post', null, null, function(genre, status, jqXHR){
    htmlUpdateProfileFormGenres(genre);
  });
}

function clickSaveProfile(e){
  var name = $('#location').val();
  var geocoder = new google.maps.Geocoder();
  var form = this;
  // var genres = [];
  // for(var i = 0; i< $('#profileFormGenres li').length; i++){
  //   $('#profileFormGenres li:nth-child[i]')
  // }
  geocoder.geocode({address: name}, function(results, status){
    var location = {};
    location.name = results[0].formattedAddress;
    location.coordinates = results[0].geometry.location;

    var locdata = {
      locname : location.name,
      latitude  : location.coordinates.lat(),
      longitude  : location.coordinates.lng()
    };

    var formSerialized = $(form).serialize();
    var locSerialized = $.param(locdata);
    var data = locSerialized + '&' + formSerialized;
    sendAjaxRequest('/musicians', data, 'post', null, null, function(musician, status, jqXHR){
      htmlUpdateMusicians(musician);
    });
  });
  e.preventDefault();
}

function clickCancelProfileSubmit(e){
  $('#musiciansIndexPage #profileForm input').val('');
  $('#musiciansIndexPage #profileForm').addClass('hidden');
  e.preventDefault();
}

function clickMusicianLink(e){
  var musicianId = $(this).attr('href');//contains the url with id
  musicianId = musicianId.slice(11);//slices out to keep just the id
  var url = '/mapDataRequest/' + musicianId;
  sendAjaxRequest(url, musicianId, 'get', null, null, function(musician, status, jqXHR){
    window.location.href = '/musicians/' + musicianId;
  });
  e.preventDefault();
}

//-------------------------------------------------------------------//
//-------------------------Login HTML changes------------------------//
//-------------------------------------------------------------------//

function htmlRegisterComplete(result){
  $('input[name="email"]').val('');
  $('input[name="password"]').val('');

  if(result.status === 'ok'){
    $('form#authentication').toggleClass('hidden');
  }
}

function htmlUpdateLoginStatus(result){
  $('input[name="email"]').val('');
  $('input[name="password"]').val('');

  if(result.status === 'ok'){
    $('form#authentication').toggleClass('hidden');
    $('#authentication-button').attr('data-email', result.email);
    $('#authentication-button').text('logout ' + result.email);
    $('#authentication-button').addClass('alert');
    $('#the-application').removeClass('hidden');
    window.location.href = '/';
  }
}

function htmlLogout(data){
  $('#authentication-button').attr('data-email', 'anonymous');
  $('#authentication-button').text('Login | Sign Up');
  $('#authentication-button').removeClass('alert');
  $('#the-application').addClass('hidden');
  window.location.href='/';
}


//-------------------------------------------------------------------//
//-------------------------All Musicians Page------------------------//
//-------------------------------------------------------------------//

//-----from submit new musician profile form-----//
function htmlUpdateMusicians(musician){
  $('#musiciansIndexPage #profileForm').addClass('hidden');
  $('#successNotifier').removeClass('hidden');
  $('#ViewMyProfileLink').attr('href', '/musicians/'+musician._id);
}
function htmlUpdateProfileFormGenres(genre){
  var $genre = $('<li>'+genre.name+'<input type="checkbox" value="'+genre.id+'" name="genres"></input></li>');
  $('#profileFormGenres').append($genre);
}

function clickViewMusicianProfile(){
  $('#successNotifier').addClass('hidden');
}

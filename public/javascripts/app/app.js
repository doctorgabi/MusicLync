/* global document, sendAjaxRequest, window */
//io was up there too; don't plan to use sockets.
var mongoose = require('mongoose');
var Musician = mongoose.model('Musician');

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
  $('#musiciansIndexPage #profileForm #cancelProfile').on('click', clickCancelProfileSubmit);
  $('#musiciansIndexPage #ViewMyProfileLink').on('click', clickViewMusicianProfile);
  $('#musiciansIndexPage .musician a').on('click', clickMusicianLink);
  initMap(lat, lng, 6);
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
  var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.SATELLITE};
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var image =  'imgages/mapMarker.png';
  new google.maps.Marker({map: map, position: (lat, lng), icon: image});
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

function clickSaveProfile(e){
  var name = $('#location').val();
  var geocoder = new google.maps.Geocoder();
  var form = this;

  geocoder.geocode({address: name}, function(results, status){
    var location = {};
    location.name = results[0].formattedAddress;
    location.coordinates = results[0].geometry.location;

    var locdata = {
      locationname : location.name,
      latitude  : location.coordinates.lat(),
      longitude  : location.coordinates.lng()
    };

    var formSerialized = $(form).serialize();
    var locSerialized = $.param(locdata);
    var data = locSerialized + '&' + formSerialized;

    sendAjaxRequest('/musicians', data, 'post', null, null, function(musician, status, jqXHR){
      htmlUpdateMusicians(musician);
      //call a function now to say congrats you saved your profile, do you want to view it or view all?
    });
  });
  e.preventDefault();
}

function clickCancelProfileSubmit(e){
  e.preventDefault();
  $('#musiciansIndexPage #profileForm input').val('');
  $('#musiciansIndexPage #profileForm').addClass('hidden');
}

function clickMusicianLink(e){
  e.preventDefault();
  var musicianId = $(this).attr('href');//contains the url with id
  debugger;
  musicianId = musicianId.slice(11);//slices out to keep just the id
  Musician.findById(musicianId, function(err, musician){
    lat = musician.latitude;
    lng = musician.longitude;
    sendAjaxRequest('/musicians/musicianId', null, 'get', null, null, function(musician, status, jqXHR){
      console.log(musician);
    });
  });
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

function clickViewMusicianProfile(){
  $('#successNotifier').addClass('hidden');
}

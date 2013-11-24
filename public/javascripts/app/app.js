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
  $('#musiciansIndexPage #searchMusiciansButton').on('click', clickSearchMusician);
  $('#musiciansIndexPage #profileForm h5').on('click', clickProfileSubheader);
  $('#musiciansIndexPage #profileForm').on('submit', clickSaveProfile);
  $('#musiciansIndexPage #profileForm #addGenreButton').on('click', clickAddGenre);
  $('#musiciansIndexPage #profileForm #addInstrumentButton').on('click', clickAddInstrument);
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

function clickSearchMusician(){
  $('#searchForm').removeClass('hidden');
  //put an ajax request in here that grabs the search term location and converts it to lat & lng
  var lat = 55;
  var lng = -1.6;
  var zoom = 5;
  var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
  var map = new google.maps.Map(document.getElementById('musicians-map-canvas'), mapOptions);
  // var latLng = new google.maps.LatLng(lat, lng);
  // new google.maps.Marker({map: map, position: latLng});
  $('#musicians-map-canvas').removeClass('hidden');
  var url = '/mapDataRequest';
  sendAjaxRequest(url, null, 'get', null, null, function(musicians){
    for(var i=0; i< musicians.length; i++){
      var musician = musicians[i];
      var latLng = new google.maps.LatLng(musician.latitude, musician.longitude);
      buildInfoWindow(musician, latLng);
    }
  });
  function buildInfoWindow(musician, latLng){
    var marker = new google.maps.Marker({map: map, position: latLng, clickable: true});
    marker.info = new google.maps.InfoWindow({
      content: '<div class="musicianInfoWindow"><p>' + musician.name + '</p><img src="' + musician.photoUrl + '"/></div>'
    });
    google.maps.event.addListener(marker, 'click', function() {
      marker.info.open(map, marker);
    });
  }
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

function clickAddInstrument(){
  var instrument = $('#AddNewInstrument').val();
  var data = {name: instrument};
  sendAjaxRequest('/instruments', data, 'post', null, null, function(instrument, status, jqXHR){
    htmlUpdateProfileFormInstruments(instrument);
  });
}

function clickSaveProfile(e){
  var name = $('#location').val();
  var geocoder = new google.maps.Geocoder();
  var form = this;
  var age = $('#ageSelectBox').val();
  var ageGroup = {'ageGroup': age};
  geocoder.geocode({address: name}, function(results, status){
    var location = {};
    location.name = results[0].formattedAddress;
    location.coordinates = results[0].geometry.location;

    var locdata = {
      locname : location.name,
      latitude  : location.coordinates.lat(),
      longitude  : location.coordinates.lng()
    };

    var ageSerialized = $.param(ageGroup);
    var formSerialized = $(form).serialize();
    var locSerialized = $.param(locdata);
    var data = ageSerialized + '&' + locSerialized + '&' + formSerialized;
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

function clickViewMusicianProfile(){
  $('#successNotifier').addClass('hidden');
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
  var $genre = $('<span>'+genre.name+'<input type="checkbox" value="'+genre.id+'" name="genres"></input></span>');
  $('#profileFormGenres').append($genre);
}

function htmlUpdateProfileFormInstruments(instrument){
  var $instrument = $('<span>'+instrument.name+'<input type="checkbox" value="'+instrument.id+'" name="instruments"></input></span>');
  $('#profileFormInstruments').append($instrument);
}
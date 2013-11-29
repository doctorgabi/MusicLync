/* global document, sendAjaxRequest, sendHtmlAjaxRequest, window */
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
  $('#musiciansIndexPage .musician a').on('click', clickMusicianLink);
  $('#musiciansIndexPage #createProfileButton').on('click', clickCreateMusicianProfile);
  $('#musiciansIndexPage #profileForm h5').on('click', clickProfileSubheader);
  $('#musiciansIndexPage #profileForm').on('submit', submitSaveProfile);

  $('#musiciansIndexPage #profileForm #addGenreButton').on('click', clickAddGenre);
  $('#musiciansIndexPage #profileForm #addInstrumentButton').on('click', clickAddInstrument);
  $('#musiciansIndexPage #profileForm #cancelProfile').on('click', clickCancelProfileSubmit);
  $('#musiciansIndexPage #ViewMyProfileLink').on('click', clickViewMusicianProfile);
  $('#musiciansIndexPage #editProfileButton').on('click', clickEditMusicianProfile);
  $('#musiciansIndexPage #profileForm #updateProfile').on('click', clickUpdateProfile);
  $('#musiciansIndexPage #profileForm #deleteProfile').on('click', clickDeleteProfile);
  $('#musiciansIndexPage #searchMusiciansButton').on('click', clickSearchMusician);
  $('#musiciansIndexPage #searchMusicianByLocation').on('click', clickSearchMusicianByLocation);
  $('#musiciansIndexPage #searchMusicianByAttributes').on('click', clickSearchMusicianByAttributes);
  $('#musiciansIndexPage #startSearchMusician').on('click', clickStartSearchMusician);
  $('#musiciansIndexPage #musicianReturnLocationSearch').on('click', clickMusicianReturnLocationSearch);
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

//-------------Musicians Index Page Click Handlers-------------------//

function clickCreateMusicianProfile(){
  $('#musiciansIndexPage #profileForm').removeClass('hidden');
  $('#musiciansIndexPage #musicians').toggleClass('hidden');
  if($('#musiciansIndexPage #profileForm #saveProfile').hasClass('hidden')){
    $('#musiciansIndexPage #profileForm #saveProfile').removeClass('hidden');
  }
  if(!$('#musiciansIndexPage #profileForm #updateProfile').hasClass('hidden')){
    $('#musiciansIndexPage #profileForm #updateProfile').addClass('hidden');
  }
  if(!$('#musiciansIndexPage #profileForm #deleteProfile').hasClass('hidden')){
    $('#musiciansIndexPage #profileForm #deleteProfile').addClass('hidden');
  }
  if($('#musiciansIndexPage #profileForm #cancelProfile').hasClass('hidden')){
    $('#musiciansIndexPage #profileForm #cancelProfile').removeClass('hidden');
  }
}

function clickEditMusicianProfile(){
  $('#musiciansIndexPage #musicians').toggleClass('hidden');
  var email = $('#authentication-button').text();
  var data = {'email': email};
  sendAjaxRequest('/users', data, 'get', null, null, function(musician, status, jqXHR){
    console.log(musician.user);
    //the next line was added back in from a previous version:
    var $id = $('<p class="hidden">' + musician.user + '</p>');
    $('#musiciansIndexPage #profileForm').toggleClass('hidden');
    //so was the next line:
    $('#musiciansIndexPage #profileForm #updateProfile').append($id);
    $('#musiciansIndexPage #profileForm #updateProfile').toggleClass('hidden');
    $('#musiciansIndexPage #profileForm #saveProfile').toggleClass('hidden');
    $('#musiciansIndexPage #profileForm #deleteProfile').toggleClass('hidden');
    htmlPopulateProfileForm(musician);
  });
}

function clickDeleteProfile(e){
  //put in an 'are you sure?' button alert here then call the subsequent code if yes is clicked.
  var user = $('#musiciansIndexPage #profileForm #updateProfile p').text();
  var url = '/musicians/' + user;
  user = {'user': user};
  var data = $.param(user);
  console.log(user);
  sendAjaxRequest(url, data, 'post', 'delete', e, function(musician, status, jqXHR){
    htmlUpdateMusicians(musician);
    $('#successNotifier #successDelete').removeClass('hidden');
    $('#successNotifier #ViewMyProfileLink').addClass('hidden');
  });
  e.preventDefault();
}
//********Profile create, update or delete form button click handlers******//

function clickProfileSubheader(){
  var $subheader = $(this);
  $subheader.next().toggleClass('hidden');
  //if there's time, make all others revert to hidden when each is opened?
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

function submitSaveProfile(e){
  $('#musiciansIndexPage #profileForm').toggleClass('hidden');
  console.log('submitSaveProfile is being called');
  var name = $('#location').val();
  if(!name){ name = 'Rothera Research Station, Antarctica'; }//sets a default location to allow the asynch functions below to progress.

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
    // console.log('---------------------------------before ajax----------------------------');
    // console.log(data);
    sendAjaxRequest('/musicians', data, 'post', null, null, function(musician, status, jqXHR){
      // console.log('---------------------------------after ajax----------------------------');
      // console.log(musician);
      htmlUpdateMusicians(musician);
    });
  });
  e.preventDefault();
}

function clickCancelProfileSubmit(e){
  $('#musiciansIndexPage #profileForm input').val('');
  $('#musiciansIndexPage #profileForm').addClass('hidden');
  $('#musiciansIndexPage #musicians').toggleClass('hidden');
  e.preventDefault();
}

function clickUpdateProfile(e){
  var place = $('#location').val();
  if(!place) { place = 'Rothera Research Station, Antarctica'; }
  var geocoder = new google.maps.Geocoder();
  //can probably refactor this geocode part out of here and have it just return the locdata object.
  geocoder.geocode({address: place}, function(results, status){
    var location = {};
    location.name = results[0].formattedAddress;
    location.coordinates = results[0].geometry.location;

    var locdata = {
      locname : location.name,
      latitude  : location.coordinates.lat(),
      longitude  : location.coordinates.lng()
    };
    var locSerialized = $.param(locdata);
    //inserted from here to fix update glitch:
    var email = $('#authentication-button').text();
    var data = {'email': email};
    sendAjaxRequest('/users', data, 'get', null, null, function(musician, status, jqXHR){
      console.log('--------------------this is the userId from the ajax call----------');
      console.log(musician.user);

      var id = musician.user;
      var form = $('#musiciansIndexPage #profileForm');
      var age = $('#ageSelectBox').val();

      var ageGroup = {'ageGroup': age};
      var userId = {'user': id};

      var ageSerialized = $.param(ageGroup);
      var userSerialized = $.param(userId);
      var formSerialized = $(form).serialize();

      var data = userSerialized + '&' + ageSerialized + '&' + formSerialized + '&' + locSerialized;
      var url = '/musicians/' + id;
      sendAjaxRequest(url, data, 'post', 'put', e, function(musician, status, jqXHR){
        console.log('*******************this is after the ajax call************');
        console.log(musician);
        htmlUpdateMusicians(musician);
        $('#successNotifier #successUpdate').removeClass('hidden');
      });
    });
  });
  e.preventDefault();
}



//-------------musician search functions------------------//

function clickSearchMusician(){
  $('#musicians').addClass('hidden');
  $('#searchForm').removeClass('hidden');
}

function clickSearchMusicianByLocation(){
  var place = $('#searchLocation').val();

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({address: place}, function(results, status){
    var location = {};
    location.lat = results[0].geometry.location.ob;
    location.long = results[0].geometry.location.pb;//refactor these three lines just to lines lat & lng?

    var lat = location.lat;
    var lng = location.long;
    htmlUpdateMusiciansMap(lat, lng);
  });
}

function clickSearchMusicianByAttributes(){
  $('#musicians-map-canvas').addClass('hidden');
  $('#searchForm').toggleClass('hidden');
  $('#searchAttributesForm').removeClass('hidden');
}

function clickStartSearchMusician(e){
  var form = $('#searchAttributesForm');
  var formSerialized = $(form).serialize();

  var age = $('#ageSearchSelectBox').val();
  var ageGroup = {'ageGroup': age};
  var ageSerialized = $.param(ageGroup);
  var data = ageSerialized + '&' + formSerialized;
  sendHtmlAjaxRequest('/musicians/search', data, 'get', null, e, function(musicians, status, jqXHR){
    $('#searchAttributesForm').toggleClass('hidden');
    $('#musicians').toggleClass('hidden');
    $('#musicians').empty();
    $('#musicians').append(musicians);
  });
}

function clickMusicianReturnLocationSearch(e){
  $('#musicians-map-canvas').toggleClass('hidden');
  $('#searchForm').toggleClass('hidden');
  $('#searchAttributesForm').toggleClass('hidden');
  e.preventDefault();
}




//***********view musician links************//

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
//------------------All Musicians Page HTML changes------------------//
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

function htmlUpdateMusiciansMap(lat, lng){
  var zoom = 5;
  var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
  var map = new google.maps.Map(document.getElementById('musicians-map-canvas'), mapOptions);
  $('#musicians-map-canvas').removeClass('hidden');
  var url = '/mapDataRequest';
  sendAjaxRequest(url, null, 'get', null, null, function(musicians){
    for(var i=0; i< musicians.length; i++){
      var musician = musicians[i];
      var latLng = new google.maps.LatLng(musician.latitude, musician.longitude);
      mapMarkerBuildInfoWindow(map, musician, latLng);
    }
  });
}

function mapMarkerBuildInfoWindow(map, musician, latLng){
  var id = musician._id;
  var marker = new google.maps.Marker({map: map, position: latLng, clickable: true});
  marker.info = new google.maps.InfoWindow({
    content: '<div class="musicianInfoWindow"><p>' + musician.name + '</p><img src="' + musician.photoUrl + '"/></div>'
  });
  google.maps.event.addListener(marker, 'mouseover', function() {
    marker.info.open(map, marker);
  });
  google.maps.event.addListener(marker, 'mouseout', function(){
    marker.info.close();
  });
  google.maps.event.addListener(marker, 'click', function(musician){
    window.location.href = '/musicians/' + id;
  });
}

//-------from edit my profile button---------//
function htmlPopulateProfileForm(musician){
  $('#musiciansIndexPage #profileForm #name').val(musician.name);
  $('#musiciansIndexPage #profileForm #location').val(musician.location);
  $('#musiciansIndexPage #profileForm #availableTime').val(musician.availableTime);
  $('#musiciansIndexPage #profileForm #ageSelectBox').val(musician.ageGroup);
  $('#musiciansIndexPage #profileForm #photoUrl').val(musician.photoUrl);
  $('#musiciansIndexPage #profileForm #genres').val(musician.genres);
  $('#musiciansIndexPage #profileForm #instruments').val(musician.instruments);
  $('#musiciansIndexPage #profileForm #instrumentsTaught').val(musician.instrumentsTaught);
  $('#musiciansIndexPage #profileForm #instrumentsOwned').val(musician.instrumentsOwned);
  $('#musiciansIndexPage #profileForm #equipmentAccess').val(musician.equipmentAccess);
  $('#musiciansIndexPage #profileForm #hasPracticeSpace').val(musician.hasPracticeSpace);
  $('#musiciansIndexPage #profileForm #skills').val(musician.skills);
  $('#musiciansIndexPage #profileForm #hasEquipmentTransport').val(musician.hasEquipmentTransport);
  $('#musiciansIndexPage #profileForm #wantsToPractice').val(musician.wantsToPractice);
  $('#musiciansIndexPage #profileForm #wantsToPerform').val(musician.wantsToPerform);
  $('#musiciansIndexPage #profileForm #wantsTeacher').val(musician.wantsTeacher);
  $('#musiciansIndexPage #profileForm #feePerHourGig').val(musician.feePerHourGig);
  $('#musiciansIndexPage #profileForm #feePerHourTeach').val(musician.feePerHourTeach);
  $('#musiciansIndexPage #profileForm #feePerHourEquipment').val(musician.feePerHourEquipment);
  $('#musiciansIndexPage #profileForm #influences').val(musician.influences);
  $('#musiciansIndexPage #profileForm #website').val(musician.website);
  $('#musiciansIndexPage #profileForm #videoUrl').val(musician.videoUrl);
  $('#musiciansIndexPage #profileForm #audioUrl').val(musician.audioUrl);
  $('#musiciansIndexPage #profileForm #venueReviews').val(musician.venueReviews);
  $('#musiciansIndexPage #profileForm #bandReviews').val(musician.bandReviews);
  $('#musiciansIndexPage #profileForm #gigDates').val(musician.gigDates);
  $('#musiciansIndexPage #profileForm #gigVenues').val(musician.gigVenues);
  $('#musiciansIndexPage #profileForm #bio').val(musician.bio);
  $('#musiciansIndexPage #profileForm #googlePlusLink').val(musician.googlePlusLink);
  $('#musiciansIndexPage #profileForm #facebookLink').val(musician.facebookLink);
  $('#musiciansIndexPage #profileForm #twitterLink').val(musician.twitterLink);
  $('#musiciansIndexPage #profileForm #linkedInLink').val(musician.linkedInLink);
}

// function getMusicianIdByName(name){
//   var url = '/musiciansGetId';
//   sendAjaxRequest(url, name, 'get', null, null, function(id, status, jqXHR){
//     console.log(id);
//     //call the rest of the steps in here as it's asynchronous
//   });
// }
/* global document, sendAjaxRequest, sendHtmlAjaxRequest, alert, window */
//io was up there too; don't plan to use sockets.

$(document).ready(initialize);
var lat;
var lng;

//mostly click handlers:
function initialize(){
  $(document).foundation();
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

// Google map for the musician individual profile page.
// Global lat & lng are set when a musician is clicked.
function initMap(lat, lng, zoom){
  var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var latLng = new google.maps.LatLng(lat, lng);
  new google.maps.Marker({map: map, position: latLng});
}

// Checks if a user is logged in and if they have a profile
// set up, to determine which buttons to display.
var user = {'email': $('#authentication-button').text()};
sendAjaxRequest('/userSearch', user, 'get', null, null, function(user, status, jqXHR){
  if(user.length > 0){
    var data = {'email': $('#authentication-button').text()};
    sendAjaxRequest('/users', data, 'get', null, null, function(musician, status, jqXHR){
      if(musician){
        htmlUserHasProfile();
      }else{
        htmlUserWithoutProfile();
      }
    });
  }else{
    htmlNoUser();
  }
});



//-------------------------------------------------------------------//
//-------------------------Click Handlers----------------------------//
//-------------------------------------------------------------------//

// Registers a new User in the database.
function clickRegister(e){
  var url = '/users';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', null, e, function(data){
    htmlRegisterComplete(data);
  });
}

// Logs in an existing user.
function clickLogin(e){
  var url = '/login';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdateLoginStatus(data);
  });
}

// Offers login or logout button with
// email depending on if a user is logged in.
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

// Initiates the profile form for a new user.
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

// Gets the user from the database and returns
// the associated musician object. Hides/reveals appropriate
// form elements for edit profile. Appends musician id to
// update button. Calls populate form function.
function clickEditMusicianProfile(){
  $('#musiciansIndexPage #musicians').toggleClass('hidden');
  var email = $('#authentication-button').text();
  var data = {'email': email};
  sendAjaxRequest('/users', data, 'get', null, null, function(musician, status, jqXHR){
    var $id = $('<p class="hidden">' + musician.user + '</p>');
    $('#musiciansIndexPage #profileForm').toggleClass('hidden');
    $('#musiciansIndexPage #profileForm #updateProfile').append($id);
    $('#musiciansIndexPage #profileForm #updateProfile').toggleClass('hidden');
    $('#musiciansIndexPage #profileForm #saveProfile').toggleClass('hidden');
    $('#musiciansIndexPage #profileForm #deleteProfile').toggleClass('hidden');
    htmlPopulateProfileForm(musician);
  });
}


//********Profile create, update or delete form button click handlers******//


// Reveals or hides form sections when their
// section header is clicked.
function clickProfileSubheader(){
  var $subheader = $(this);
  $subheader.next().toggleClass('hidden');
}

// When user inputs a new genre, grabs it and
// sends ajax to the genres database compilation.
function clickAddGenre(){
  var genre = $('#AddNewGenre').val();
  var data = {name: genre};
  sendAjaxRequest('/genres', data, 'post', null, null, function(genre, status, jqXHR){
    htmlUpdateProfileFormGenres(genre);
  });
}

// When user inputs a new instrument, grabs it
// and sends ajax to the instruments database compilation.
function clickAddInstrument(){
  var instrument = $('#AddNewInstrument').val();
  var data = {name: instrument};
  sendAjaxRequest('/instruments', data, 'post', null, null, function(instrument, status, jqXHR){
    htmlUpdateProfileFormInstruments(instrument);
  });
}

// User must add a location, if not they get an alert.
// If so, the location gets geocoded, and the age select
// box form are grabbed as variables. Geocoder callback
// serializes the location data, age, and form then
// concatenates and sends ajax to make new musician
// object in the database.
function submitSaveProfile(e){
  $('#musiciansIndexPage #profileForm').toggleClass('hidden');
  var name = $('#location').val();
  if(!name){alert('Please enter your location');
  }else{
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
        $('#successNotifier #success').removeClass('hidden');
        htmlUpdateMusicians(musician);
      });
    });
  }
  e.preventDefault();
}

// If they cancel profile submission all inputs are
// emptied out and the form is hidden again.
function clickCancelProfileSubmit(e){
  $('#musiciansIndexPage #profileForm input').val('');
  $('#musiciansIndexPage #profileForm').addClass('hidden');
  $('#musiciansIndexPage #musicians').toggleClass('hidden');
  e.preventDefault();
}

// Similar to create profile. Location is required
// and is sent to geocode. On callback the
// email is grabbed and used to ajax call
// to get the correct musician. On callback the form,
// age and location are serialized and concatenated
// and sent by Ajax to update the existing musician.
// Success notifier is revealed.
function clickUpdateProfile(e){
  var place = $('#location').val();
  if(!place){
    alert('Please enter your location');
  }else{
    var geocoder = new google.maps.Geocoder();
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
      var email = $('#authentication-button').text();
      var data = {'email': email};
      sendAjaxRequest('/users', data, 'get', null, null, function(musician, status, jqXHR){
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
          htmlUpdateMusicians(musician);
          $('#successNotifier #successUpdate').removeClass('hidden');
        });
      });
    });
  }
  e.preventDefault();
}



// Gets the musician id from the hidden form element
// and passes it via ajax to delete the musician profile,
// but not the user. Updates
function clickDeleteProfile(e){
  var user = $('#musiciansIndexPage #profileForm #updateProfile p').text();
  var url = '/musicians/' + user;
  user = {'user': user};
  var data = $.param(user);
  sendAjaxRequest(url, data, 'post', 'delete', e, function(musician, status, jqXHR){
    htmlUpdateMusicians(musician);
    $('#successNotifier #successDelete').removeClass('hidden');
    $('#successNotifier #ViewMyProfileLink').addClass('hidden');
  });
  e.preventDefault();
}




//-------------musician search functions------------------//

// Reveals the musician search form.
function clickSearchMusician(){
  $('#musicians').addClass('hidden');
  $('#searchForm').removeClass('hidden');
}


// Grabs the search location and geocodes it.
// Calls the map update function passing in
// the appropriate latitude and longitude.
function clickSearchMusicianByLocation(){
  var place = $('#searchLocation').val();

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({address: place}, function(results, status){
    var location = {};
    location.lat = results[0].geometry.location.ob;
    location.long = results[0].geometry.location.pb;

    var lat = location.lat;
    var lng = location.long;
    htmlUpdateMusiciansMap(lat, lng);
  });
}

// If attribute search is selected the location
// search form and map are hidden and the attributes
// search form is revealed.
function clickSearchMusicianByAttributes(){
  $('#musicians-map-canvas').addClass('hidden');
  $('#searchForm').toggleClass('hidden');
  $('#searchAttributesForm').removeClass('hidden');
}


// when attributes search form filled in, inputs
// are grabbed, serialezed and concatenated, then
// sent by Ajax to find matching musicians.
// The callback hides the searchform, empties out
// the existing page of musicians then appends
// only the musicians that were returned.
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


// Hides the attributes search form and re-opens the
// location search form.
function clickMusicianReturnLocationSearch(e){
  $('#musicians-map-canvas').toggleClass('hidden');
  $('#searchForm').toggleClass('hidden');
  $('#searchAttributesForm').toggleClass('hidden');
  e.preventDefault();
}




//***********view musician links************//


// When a musician image is clicked its id is
// sliced from the href attribute. It is passed
// via ajax to find the correct musician and set
// the new window location accordingly (this will
// trigger a GET to musicians/:id).
function clickMusicianLink(e){
  var musicianId = $(this).attr('href');
  musicianId = musicianId.slice(11);
  var url = '/mapDataRequest/' + musicianId;
  sendAjaxRequest(url, musicianId, 'get', null, null, function(musician, status, jqXHR){
    window.location.href = '/musicians/' + musicianId;
  });
  e.preventDefault();
}

// Hides the success notifier when
// the link is clicked.
function clickViewMusicianProfile(){
  $('#successNotifier').addClass('hidden');
}
//-------------------------------------------------------------------//
//-------------------------Login HTML changes------------------------//
//-------------------------------------------------------------------//


// Ajax callback from clicking register.
// Empties the inputs and hides the register form.
function htmlRegisterComplete(result){
  $('input[name="email"]').val('');
  $('input[name="password"]').val('');

  if(result.status === 'ok'){
    $('form#authentication').toggleClass('hidden');
  }
}

// Ajax callback from clicking login.
// Empties the inputs, hides the login form,
// changes the login button to the user's
// email and returns the user to the homepage.
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

// Ajax callback from clicking authentication button
// when logged in. Returns default settings to
// buttons and takes user back to home page.
function htmlLogout(data){
  $('#authentication-button').attr('data-email', 'anonymous');
  $('#authentication-button').text('Login | Sign Up');
  $('#authentication-button').removeClass('alert');
  $('#the-application').addClass('hidden');
  window.location.href='/';
}

// 1 of these 3 functions is called on page load depending on if
// a user is logged in and if they have a profile already. Shows/
// hides buttons.
function htmlNoUser(){
  $('#musiciansIndexPage #createProfileButton').addClass('hidden');
  $('#musiciansIndexPage #editProfileButton').addClass('hidden');
}

function htmlUserWithoutProfile(){
  $('#musiciansIndexPage #createProfileButton').removeClass('hidden');
  $('#musiciansIndexPage #editProfileButton').addClass('hidden');
}

function htmlUserHasProfile(){
  $('#musiciansIndexPage #createProfileButton').addClass('hidden');
  $('#musiciansIndexPage #editProfileButton').removeClass('hidden');
}

//-------------------------------------------------------------------//
//------------------All Musicians Page HTML changes------------------//
//-------------------------------------------------------------------//



// Ajax callback passing musician that was either
// successfully created, edited or deleted.
// Hides the profile form, shows the succes
// notifier and adds appropriate id to the 'view' link
// (view link will be hidden on delete).
function htmlUpdateMusicians(musician){
  $('#musiciansIndexPage #profileForm').addClass('hidden');
  $('#successNotifier').removeClass('hidden');
  $('#ViewMyProfileLink').attr('href', '/musicians/'+musician._id);
}

// Ajax callback from user adding new genre
// to the database. Appends genres
// with checkboxes to the profile form.
function htmlUpdateProfileFormGenres(genre){
  var $genre = $('<span>'+genre.name+'<input type="checkbox" value="'+genre.id+'" name="genres"></input></span>');
  $('#profileFormGenres').append($genre);
}

// Ajax callback from user adding a new
// instrument to the database. Appends
// instruments with checkboxes to the profile form.
function htmlUpdateProfileFormInstruments(instrument){
  var $instrument = $('<span>'+instrument.name+'<input type="checkbox" value="'+instrument.id+'" name="instruments"></input></span>');
  $('#profileFormInstruments').append($instrument);
}


// Called when user searches for a musician by location.
// Geocoded lat and long are used to display the map.
// Sends ajax request to get musicians and pass them on callback
// through a for loop to append their markers to the map,
// passing in musician, map and co-ordinates.
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

// Ajax callback from searching for musicians by location.
// Receives musician object, map and co-ordinates, and creates
// a map marker for that musician. Adds hover states to reveal
// musicians name and image to marker. Makes marker a clickable
// link to that musicians profile page.
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


// Ajax callback from edit profile button click.
// Inserts all current musician object values
// into the profile form ready for editing.
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
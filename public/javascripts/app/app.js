/* global document, sendAjaxRequest, window, io */

$(document).ready(initialize);

var socket;

function initialize(){
  $(document).foundation();
  initializeSocketIO();
  $('#authentication-button').on('click', clickAuthenticationButton);
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#musiciansIndexPage #createProfileButton').on('click', clickCreateMusicianProfile);
  $('#musiciansIndexPage #profileForm h5').on('click', clickProfileSubheader);
  $('#musiciansIndexPage #profileForm #cancelProfile').on('click', clickCancelProfileSubmit);

}

function initializeSocketIO(){
  var port = window.location.port ? window.location.port : '80';
  var url = window.location.protocol + '//' + window.location.hostname + ':' + port + '/app';

  socket = io.connect(url);
  socket.on('connected', socketConnected);
}

function socketConnected(data){
  console.log(data);
}
//-------------------------------------------------------------------//
//-------------------------Click Handlers----------------------------//
//-------------------------------------------------------------------//


function clickRegister(e){
  var url = '/users';
  var data = $('form#authentication').serialize();//quickly grab the whole form using serialize
  sendAjaxRequest(url, data, 'post', null, e, function(data){
    htmlRegisterComplete(data);
  });//brought in from 'utilities file'. there's already a prevent default in there.
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
  $subheader.children().toggleClass('hidden');
}

function clickCancelProfileSubmit(){
  $('#musiciansIndexPage #profileForm input').val('');
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
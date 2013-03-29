function Google() {
	//establishing connection to windows server

	var CLIENT_ID = 'YOUR CLIENT ID';
	var CLIENT_SECRET = 'YOUR CLIENT SECRET';
	var SCOPES = 'https://www.google.com/m8/feeds';
	var REDIRECT_URI = 'YOUR REDIRECT URI';
	var AUTHORIZATION_CODE = "";
	var ACCESS_TOKEN = "";
	var AUTHENTICATION_TOKEN = "";
	var REFRESH_TOKEN = "";
	var gContacts = [];

	// Create our main window
	var gWindow = Ti.UI.createWindow({
		modal : true,
		exitOnClose : false // Android only
	});

	//creating a loading indicator

	var activityIndicator = Ti.UI.createActivityIndicator({
		bottom : 30,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		color : "#D34836",
		indicatorColor : "#D34836"

	});
	activityIndicator.message = ' Connecting to Google...';
	activityIndicator.show();

	gWindow.add(activityIndicator);

	function printContacts() {

		for (var l = 0; l < gContacts.length; l++) {
			Ti.API.info(l + ") NAME:" + gContacts[l].name + " ****** EMAIL:" + gContacts[l].email);
		};
		activityIndicator.hide();
	}

	//fetching the contacts

	function getContacts() {
		activityIndicator.message = " Fetching Google Contacts ..."
		var xhr = Titanium.Network.createHTTPClient();
		var _url = 'https://www.google.com/m8/feeds/contacts/default/full?alt=json';
		xhr.open("GET", _url);
		xhr.setRequestHeader("GData-Version", "3.0");
		var _params = {
			"access_token" : ACCESS_TOKEN,
		};

		xhr.send(_params);
		xhr.onload = function() {
			Ti.API.info('RAW =' + this.responseText);
			if (this.status == '200') {
				Ti.API.info('got my response, http status code ' + this.status);
				if (this.readyState == 4) {
					var response = this.responseText;
					Ti.API.info("RESPONSE:" + response);
					var jsonResponse = JSON.parse(response);
					var jsonData = jsonResponse["feed"]["entry"];
					for (var i = 0; i < jsonData.length; i++) {
						try {
							var gContact = [];
							gContact.name = "";
							gContact.email = "";
							var jsonItem = jsonData[i];
							var Email = jsonItem["gd$email"][0]["address"];
							var Name;
							if (jsonItem["gd$name"] != undefined)
								Name = jsonItem["gd$name"]["gd$givenName"]["$t"];
							else
								Name = Email;

							Ti.API.warn(i + ")Name:" + Name);
							Ti.API.warn(i + ")Email:" + Email);
							gContact.name = Name;
							gContact.email = Email;
							gContacts.push(gContact);
						} catch(e) {

						}
					};
					activityIndicator.hide();
					printContacts();
				} else {
					Ti.API.error('HTTP Ready State != 4');
				}
			} else {

				Ti.API.error("Error =>" + this.response);
			}

		};
	}

	//getting the access token

	function getAccessToken() {
		activityIndicator.show();
		var xhr = Titanium.Network.createHTTPClient();
		var _url = 'https://accounts.google.com/o/oauth2/token';
		xhr.open("POST", _url);
		var _params = {
			"client_id" : CLIENT_ID,
			"redirect_uri" : REDIRECT_URI,
			"client_secret" : CLIENT_SECRET,
			"code" : AUTHORIZATION_CODE,
			"grant_type" : "authorization_code"
		};

		xhr.send(_params);
		xhr.onload = function() {
			Ti.API.info('RAW =' + this.responseText);
			if (this.status == '200') {
				Ti.API.info('got my response, http status code ' + this.status);
				if (this.readyState == 4) {
					var response = this.responseText;
					var JSONResponse = JSON.parse(response);
					ACCESS_TOKEN = JSONResponse["access_token"];
					REFRESH_TOKEN = JSONResponse["refresh_token"];
					Ti.API.warn("AccessToken:" + ACCESS_TOKEN + " ## RefreshToken:" + REFRESH_TOKEN);
					getContacts();
				} else {
					Ti.API.error('HTTP Ready State != 4');
				}
			} else {

				Ti.API.error("Error =>" + this.response);
			}

		};
	}

	//PLEASE CHANGE THE WEBVIEW DEFAULT URL TO PINDOTS SERVER LATER ON.
	//create the webview

	var gWebView = Ti.UI.createWebView({
		left : 0,
		top : 0,
		right : 0,
		bottom : 0,
		scalesPageToFit : true,
		backgroundColor : 'white',
		opacity : 0,
		enableZoomControls : false
	});

	//Request the Authorization Code below to proceed

	var url = 'https://accounts.google.com/o/oauth2/auth';
	url += "?client_id=" + CLIENT_ID;
	url += "&scope=" + SCOPES;
	url += "&response_type=code";
	url += "&redirect_uri=" + REDIRECT_URI;
	url += "&access_type=offline";

	Ti.API.warn("URL:" + url);

	gWebView.setUrl(url);
	var loadEvent = function(e) {
		var loading_url = e.url;
		Ti.API.info("LOADING:" + loading_url);

	}
	gWebView.addEventListener('beforeload', loadEvent);
	gWebView.addEventListener('load', function(e) {
		if (e.url.indexOf("approval") > 0) {
			activityIndicator.hide();
			AUTHORIZATION_CODE = gWebView.evalJS("document.title").split("code=")[1];

			gWebView.hide();
			getAccessToken();
		}
	});
	gWindow.add(gWebView);

	return gWindow;
}

module.exports = Google;

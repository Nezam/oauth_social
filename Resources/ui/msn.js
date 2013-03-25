function MSN() {
	//establishing connection to windows server

	var CLIENT_ID = 'YOUR CLIENT ID HERE';
	var CLIENT_SECRET = 'YOUR CLIENT SECRET HERE';
	var SCOPES = 'wl.basic,wl.contacts_emails,wl.offline_access';//may add more scopes
	var REDIRECT_URI = 'YOUR REDIRECT URI HERE';
	var AUTHORIZATION_CODE = "";
	var ACCESS_TOKEN = "";
	var AUTHENTICATION_TOKEN = "";
	var liveContacts = [];
	
	// Create our main window
	var msnWindow = Ti.UI.createWindow({
		modal : true,
		exitOnClose : false // Android only
	});
	
	//creating a loading indicator

	var activityIndicator = Ti.UI.createActivityIndicator({
		bottom : 30,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		color:"#2E9AFE",
		indicatorColor:"#2E9AFE"
	});
	activityIndicator.message = ' Waiting for Windows Live Connect...';
	activityIndicator.show();
	
	msnWindow.add(activityIndicator);
	
	function printContacts()
	{
		for (var l=0; l < liveContacts.length; l++) {
		 Ti.API.info(l+") NAME:" +liveContacts[l].name+" ****** EMAIL:"+liveContacts[l].email);
		};
	}
	
	//fetching the contacts
	
	function getContacts() {
		activityIndicator.message=" Fetching Live Contacts ..."
		var xhr = Titanium.Network.createHTTPClient();
		var _url = 'https://apis.live.net/v5.0/me/contacts';
		xhr.open("GET", _url);
		//xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var _params = {
			"access_token" : ACCESS_TOKEN,
			"authentication_token" : AUTHENTICATION_TOKEN,
			"scope" : SCOPES,
			//"code" : AUTHORIZATION_CODE,
			//"grant_type" : "authorization_code"
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
					var jsonData = jsonResponse["data"];
					for (var i = 0; i < jsonData.length; i++) {
						var liveContact = [];
						liveContact.name="";
						liveContact.email="";
						var jsonItem = jsonData[i];
						var Name = jsonItem["name"];
						var Email = jsonItem["emails"]["preferred"];
						Ti.API.warn(i + ")Name:" + Name);
						Ti.API.warn(i + ")Email:" + Email);
						liveContact.name=Name;
						liveContact.email=Email;
						liveContacts.push(liveContact);
					};
					activityIndicator.hide();
				printContacts();
				} else {
					Ti.API.error('HTTP Ready State != 4');
				}
			} else {
				//alert('HTTp Error Response Status Code = ' + this.status);
				Ti.API.error("Error =>" + this.response);
			}

		};
	}

	//getting the access token

	function getAccessToken() {
		activityIndicator.show();
		var xhr = Titanium.Network.createHTTPClient();
		var _url = 'https://login.live.com/oauth20_token.srf';
		xhr.open("POST", _url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
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
					AUTHENTICATION_TOKEN = JSONResponse["authentication_token"];
					Ti.API.warn("AccessToken:" + ACCESS_TOKEN + " ## AuthToken:" + AUTHENTICATION_TOKEN);
					getContacts();
				} else {
					Ti.API.error('HTTP Ready State != 4');
				}
			} else {
				//alert('HTTp Error Response Status Code = ' + this.status);
				Ti.API.error("Error =>" + this.response);
			}

		};
	}

	
	//create the webview

	var msnWebView = Ti.UI.createWebView({
		left : 0,
		top : 0,
		right : 0,
		bottom : 0,
		scalesPageToFit : true,
		backgroundColor : 'transparent',
		opacity : 0,
		enableZoomControls : false // Android only
		
	});
	
	//Request the Authorization Code below to proceed
	
	var url = 'https://login.live.com/oauth20_authorize.srf';
	url += "?client_id=" + CLIENT_ID;
	url += "&scope=" + SCOPES;
	url += "&response_type=code";
	url += "&redirect_uri=" + REDIRECT_URI;

	Ti.API.warn("URL:" + url);
	msnWebView.setUrl("http://live.com");
	var loadEvent = function(e) {
		var loading_url = e.url;
		Ti.API.info("LOADING:" + loading_url);
		if (loading_url.indexOf('mail.live.com') > 0) {
			activityIndicator.hide();
			msnWebView.setUrl(url);
			alert("Please verify your password on the next screen & allow PinDots to fetch your contacts email addresses.You may need to zoom-in in the next window.");
		} else if (loading_url.indexOf('code=') > 0) {
			var arr = loading_url.split('code=');
			AUTHORIZATION_CODE = arr[1];
			Ti.API.warn("AUTHORIZATION_CODE:" + AUTHORIZATION_CODE);
			msnWebView.hide();
			getAccessToken();

		}
	}
	msnWebView.addEventListener('beforeload', loadEvent);
	msnWindow.add(msnWebView);
	//msnWindow.open();
	return msnWindow;
}

module.exports = MSN;

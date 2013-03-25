function Yahoo() {

	//initialising yahoo developer credentials/variables

	var ConsumerKey = 'CONSUMER KEY HERE';
	var ConsumerSecret = 'CONSUMER SECRET HERE';
	var oauth_token = "";
	var oauth_token_secret = "";
	var oauth_expires_in = "";
	var xoauth_request_auth_url = "";
	var access_token = "";
	var access_token_secret = "";
	var session_handle = "";
	var yahoo_guid = "";
	var xmlData;
	var contacts = [];

	//creating a loading indicator

	var activityIndicator = Ti.UI.createActivityIndicator({
		bottom : 30,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE
	});
	activityIndicator.message = ' Connecting to Yahoo!...';
	activityIndicator.show();

	// Create our main window
	var yahooWin = Ti.UI.createWindow({
		modal : true,
		exitOnClose : false // Android only
	});
	yahooWin.add(activityIndicator);

	//function to purge email into name,wherever they were empty

	function normalizeContactsArray() {
		for (var c = 0; c < contacts.length; c++) {
			if (contacts[c].name == "" || contacts[c].name == null)
				contacts[c].name = contacts[c].email;

			Ti.API.warn(c + ")CONTACT NAME--" + contacts[c].name + "     CONTACT EMAIL:" + contacts[c].email);
		};
		activityIndicator.hide();
	}

	//function to walkthrough the nodes to build our array

	function processNodes(xml) {
		var contactList = xml.getElementsByTagName("contact");

		for (var i = 0; i < contactList.length; i++) {
			var fieldsNodeList = contactList.item(i).childNodes;
			//Ti.API.info(i + ')length of fieldsNodeList :' + fieldsNodeList.length);
			var con = [];
			con.name = "";
			con.email = "";
			for (var j = 0; j < fieldsNodeList.length; j++) {
				var fieldNode = fieldsNodeList.item(j);

				//Ti.API.info('traversing each field....fieldNode.nodeName :'+fieldNode.nodeName);
				if (fieldNode.nodeName == "fields") {
					var cid = fieldNode.childNodes.item(0).textContent;
					var type = fieldNode.childNodes.item(1).textContent;
					var value = fieldNode.childNodes.item(2).textContent;
					if (type == "email") {
						Ti.API.info('EMAIL:' + value);
						con.email = value;
					} else if (type == "name") {
						Ti.API.info('NAME:' + fieldNode.childNodes.item(2).childNodes.item(0).textContent);
						con.name = fieldNode.childNodes.item(2).childNodes.item(0).textContent;
					}
				}

			}
			contacts.push(con);
			Ti.API.info("pushed: con email:" + con.email + " name:" + con.name);
			//Ti.API.info('contactList.item(' + i + ').textContent=' + contactList.item(i).textContent);
		}
		normalizeContactsArray();
	}
	
	//function to create a signature based on the parameter supplied as a baseString
	
	function getYahooSignature(verb, baseURL, parameterString) {
		
		//follow steps to create a HMAC-SHA1 signature
		//https://dev.twitter.com/docs/auth/creating-signature
		
		try {
			var key = ConsumerSecret + "&" + access_token_secret;
			var baseString = "";
			baseString = verb + "&" + Ti.Network.encodeURIComponent(baseURL) + "&" + Ti.Network.encodeURIComponent(parameterString);
			//call the functions of social.js here
			Ti.API.warn("key:" + key);
			Ti.API.warn("baseString:" + baseString);
			Ti.include("social.js");
			var signature = b64_hmac_sha1(key, baseString);
			Ti.API.info("SIGNATURE ALERT:" + signature);
			return signature + "=";
		} catch(e) {
			Ti.API.error("SigErr:" + e);
		}
	}
	
	//function to getContacts
	
	function getContacts() {
		try {
			var xhr = Titanium.Network.createHTTPClient();
			var currentdatetime = new Date();
			
			var timestamp1 = Date.parse(currentdatetime) / 1000;
			//var url="http://query.yahooapis.com/v1/yql/mereKon/qKon"
			var url = 'http://social.yahooapis.com/v1/user/' + yahoo_guid + '/contacts';
			
			var paramString = "oauth_consumer_key=" + ConsumerKey;
			paramString += "&oauth_nonce=" + "143121";
			paramString += "&oauth_signature_method=" + "HMAC-SHA1";
			paramString += "&oauth_timestamp=" + timestamp1;
			paramString += "&oauth_token=" + access_token;
			paramString += "&oauth_version=1.0";
			paramString += "&realm=yahooapis.com";
			var sP;

			sP = getYahooSignature("GET", url, paramString);

			Ti.API.warn("decoded OAUTH:" + Ti.Network.decodeURIComponent(access_token));
			Ti.API.warn("URL:" + url);
			
			xhr.open("GET", url);
			xhr.setRequestHeader("Authorization", "OAuth");

			Ti.API.error("timestamp was " + timestamp1 + "and at:" + access_token + " and sP:" + sP);
			xhr.send({
				//'format' : 'json',
				'oauth_consumer_key' : ConsumerKey,
				'oauth_nonce' : "143121",
				'oauth_signature_method' : "HMAC-SHA1",
				'oauth_timestamp' : timestamp1,
				'oauth_token' : Ti.Network.decodeURIComponent(access_token),
				'oauth_version' : "1.0",
				'oauth_signature' : sP,
				'realm' : "yahooapis.com"

			});

			xhr.onerror = function(err) {
				Ti.API.error("ERROR WAS:" + err.error);
			};
			xhr.onload = function() {
				Ti.API.info('RAW =' + this.responseText);
				if (this.status == '200') {
					Ti.API.info('got my response, http status code ' + this.status);
					if (this.readyState == 4) {
						
						xmlData = Titanium.XML.parseString(this.responseText);
						processNodes(xmlData);
					} else {
						Ti.API.error('HTTP Ready State != 4');
					}
				} else {
					//alert('HTTp Error Response Status Code = ' + this.status);
					Ti.API.error("Error =>" + this.response);
				}

			};

		} catch(e) {
			Ti.API.error(e);
		}
	}

	//	 Create a WebView, this will host the HTML
	var YahooWebView = Ti.UI.createWebView({
		left : 0,
		top : 0,
		right : 0,
		bottom : 0,
		scalesPageToFit : true,
		backgroundColor :  'transparent' ,
		opacity : 0,
		enableZoomControls : false, // Android only
		url : 'OPEN A URL HERE'
	});
	yahooWin.add(YahooWebView);

	YahooWebView.addEventListener('load', function(e) {
		//alert(webView.getUrl());
		if (YahooWebView.getUrl().indexOf('oauth_verifier') > 0) {
			try {
				activityIndicator.message = " Getting contacts from Yahoo!..Please wait.."
				activityIndicator.show();
				var currentdatetime = new Date();
				var timestamp = Date.parse(currentdatetime) / 1000;
				var str = YahooWebView.getUrl();
				var arr = str.split('oauth_verifier=');
				var oauth_verifier = arr[1];
				Ti.API.warn("OAUTH VERIFIER:" + oauth_verifier + " OAUTH TOKEN:" + oauth_token);
				var xhr = Titanium.Network.createHTTPClient();
				//timestamp= Date.parse(timestamp).getTime()/1000;
				var url = 'https://api.login.yahoo.com/oauth/v2/get_token';
				url += '?oauth_nonce=' + 'p0p@wA$h3rE';
				url += '&oauth_timestamp=' + timestamp;
				url += '&oauth_consumer_key=' + ConsumerKey;
				url += '&oauth_signature_method=' + 'plaintext';
				url += '&oauth_signature=' + ConsumerSecret + '%26' + oauth_token_secret;
				url += '&oauth_version=1.0';
				url += '&oauth_token=' + oauth_token;
				url += '&oauth_verifier=' + oauth_verifier;
				xhr.open("GET", url);

				xhr.send();
				xhr.onload = function() {
					Ti.API.info('RAW =' + this.responseText);
					if (this.status == '200') {
						Ti.API.info('got my response, http status code ' + this.status);
						if (this.readyState == 4) {
							var ResponseXML = this.responseText;
							var array = ResponseXML.split("&");
							access_token = array[0].split("=")[1].toString();
							access_token_secret = array[1].split("=")[1].toString();
							session_handle = array[3].split("=")[1].toString();
							yahoo_guid = array[5].split("=")[1].toString();
							Ti.API.warn("GUID was " + yahoo_guid + " closing webview");
							YahooWebView.hide();
							getContacts();

						} else {
							//alert('HTTP Ready State != 4');
						}
					} else {
						//alert('HTTp Error Response Status Code = ' + this.status);
						Ti.API.error("Error =>" + this.response);
					}

				};
			} catch(e) {
				Ti.API.error("Ex:" + e);
			}
			//alert('was true');
		}
	});
	
	//setting the webview to the yahoo authorization page
	
	function getAuthorization(oauthToken) {
		YahooWebView.setScalesPageToFit(true);
		var authPageURL = "https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=" + oauthToken;
		YahooWebView.setUrl(authPageURL);
		activityIndicator.hide();

		alert("Please login to your account to allow PinDots to fetch your contacts.You may need to zoom-in in the next window");
	}

	// trying to get the request token here..
	
	var currentdatetime = new Date();
	var timestamp = Date.parse(currentdatetime) / 1000;
	var xhr = Titanium.Network.createHTTPClient();
	var url = 'https://api.login.yahoo.com/oauth/v2/get_request_token';
	url += '?oauth_nonce=' + 'p0p@wA$h3rE';
	url += '&oauth_timestamp=' + timestamp;
	url += '&oauth_consumer_key=' + ConsumerKey;
	url += '&oauth_signature_method=' + 'plaintext';
	url += '&oauth_signature=' + ConsumerSecret + '%26';
	url += '&oauth_version=1.0';
	url += '&oauth_callback=' + 'REDIRECT_CALLBACK HERE';
	xhr.open("GET", url);
	xhr.send();
	xhr.onload = function() {
		Ti.API.info('RAW =' + this.responseText);
		if (this.status == '200') {
			Ti.API.info('got my response, http status code ' + this.status);
			if (this.readyState == 4) {
				var ResponseXML = this.responseText;

				var array = ResponseXML.split("&");
				oauth_token = array[0].split("=")[1].toString();
				oauth_token_secret = array[1].split("=")[1].toString();
				xoauth_request_auth_url = array[2].split("=")[1].toString();

				getAuthorization(oauth_token);

			} else {
				//alert('HTTP Ready State != 4');
			}
		} else {
			//alert('HTTp Error Response Status Code = ' + this.status);
			Ti.API.error("Error =>" + this.response);
		}
	};

	return yahooWin;

}

module.exports = Yahoo;

// Application Window Component Constructor
function ApplicationWindow() {

	// If you don't want margins around the Translucent or Web View you can set the gutter to zero.
	var gutter = Ti.Platform.displayCaps.platformWidth * 0.025;
	// The translucent view is a stylish rounded rect behind the web view.
	var translucentViewOn = true;
	// If you want the translucent view or the web view to fade in slowly, set this to true.
	var animationsOn = true;
	// If you don't want a navBar with the corresponding back button you can set this to false.
	// If so, this requires you to have a back button in your HTML on iOS. Android uses standard hardware back button.
	var titleBarOn = true;
	// Set the background color appropriately.
	var backgroundColor = '#f1e9cf';
	// Popup menu/drawer for forward/back. Without this cross-file links will have no way of getting back to the
	// calling file without a UI in the HTML proper.
	var drawerOn = true;

	var osname = Ti.Platform.osname;

	// Create our main window
	var self = Ti.UI.createWindow({
		// If no image desired, you can remove this line and set the backgroundColor instead.
		// backgroundImage : '/images/background.png',
		navBarHidden : !titleBarOn, // iOS only
		//       barColor : barColor,
		modal : true,
		exitOnClose : true // Android only
	});
	
	
	//YAHOO!
	/*
	// Load the platform specific UI.
	var YahooWindow = require('yahoo');

	return YahooWindow();
	*/
	
	//MSN
	
	var MSN = require('msn');
	return MSN();
	//return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;

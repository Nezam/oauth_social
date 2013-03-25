// **** NB: Only tested for mobileweb and ios right now ****

// Drawer containing a button bar to drag up from the bottom of the screen by pressing the pull tab.
var pullTabSize = { width: 48, height: 16 };
var iconSize = { width: 48, height: 48 };
var opacity = 0.75;
var speed = 500;

// Gets all the applicable sizes based on the current size of the screen, used for initial layout and handling rotation
// @opened  boolean Indicates whether the tray should be opened or closed when determine dimensions.
function DrawerGetLayout(/*boolean*/opened, /*boolean*/titleBarOn) {  
    var layout = {};
       
    layout.pullTabButton = {
        center: { x: '50%' },
        top: 0,
        width: pullTabSize.width,
        height: pullTabSize.height
    };
    layout.buttonBar = {
        left: 0,
        top: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE
    };
    layout.view = {
        left: 0,
        right: 0,
        bottom: (opened ? 0 : -iconSize.height), 
        width: Ti.UI.FILL,
        height: iconSize.height + pullTabSize.height        
    };    
 
    return layout;
}

function DrawerRelayout() {
    // Relayout all elements for the drawer.
    var self = this;
    var layout = DrawerGetLayout(self.opened, !self.parent.navBarHidden);
    
    for (var i in layout) {
        if (layout.hasOwnProperty(i)) {
            for (var j in layout[i]) {
                if (layout[i].hasOwnProperty(j)) {
                    self[i][j] = layout[i][j];
                }
            }
        }
    }
}

function Drawer(/*TiUIWindow*/parent) {
    var self = this;
 
    self.parent = parent;
    self.opened = false;    // Start out with the drawer closed

     // The user clicks on the pull tab to open/close the drawer.    
    self.pullTabButton = Ti.UI.createButton({
       backgroundImage: '/images/PullTab.png',
       opacity: opacity
    });
    self.pullTabButton.addEventListener('click', function PullTabClick(e) {
        if (self.opened) {
            self.close();
        } else {
            self.open();
        }
    });

   // Button bar below the pull tab
    self.buttonBar = Ti.UI.createView({
         backgroundColor: 'black',
        opacity: opacity,
        layout: 'horizontal'
    });

    // High level container    
    self.view = Ti.UI.createView({
         layout: 'vertical'
     });
    self.view.add(self.pullTabButton);
    self.view.add(self.buttonBar);
    
    // Layout all of our elements.
    self.relayout();

    // // Handle orientation.  
    // function relayout(e) {
        // self.relayout();
    // }
    // parent.addEventListener("close", function parentClose(e) {
        // Ti.Gesture.removeEventListener("orientationchange", relayout);
    // });
    // Ti.Gesture.addEventListener("orientationchange", relayout);

    return self;
}

function DrawerOpen() {
    this.fireEvent('open', {source: this, type: 'open'});

    if (this.opened) { 
        return;     // Already opened.
    }
    this.opened = true;
    
    // Slide up
    var layout = DrawerGetLayout(this.opened, !this.parent.navBarHidden);
    var animation = Ti.UI.createAnimation({
       bottom: layout.view.bottom,
       duration: speed 
    });
    this.view.animate(animation);
}

function DrawerClose() {
    this.fireEvent('close', {source: this, type: 'close'});
    
    if (!this.opened) { 
        return;     // Already closed
    }
    this.opened = false;
    
    // Slide down
    var layout = DrawerGetLayout(this.opened,!this.parent.navBarHidden);
    var animation = Ti.UI.createAnimation({
       bottom: layout.view.bottom,
       duration: speed 
    });
    this.view.animate(animation);
}

function DrawerAddEventListener(name, func) {
    Ti.App.addEventListener('drawer.'+ name, func);
}

function DrawerRemoveEventListener(name, func) {
    Ti.App.removeEventListener('drawer.'+ name, func);
}

function DrawerFireEvent(name, obj) {
    Ti.App.fireEvent('drawer.'+ name, obj);
}

Drawer.prototype.open = DrawerOpen;
Drawer.prototype.close = DrawerClose;
Drawer.prototype.addEventListener = DrawerAddEventListener;
Drawer.prototype.removeEventListener = DrawerRemoveEventListener;
Drawer.prototype.fireEvent = DrawerFireEvent;
Drawer.prototype.relayout = DrawerRelayout;
module.exports = Drawer;


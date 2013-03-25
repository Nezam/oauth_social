var ti_injection_id = '__ti_injection';
 
// find the Titanium script tag
var ti_injection = document.getElementById(ti_injection_id);
if (ti_injection === null) {
    // if it's not already on the page, then check the localstorage
    ti_injection = localStorage.getItem('ti_injection');
    if (ti_injection !== null) {
        // create a script tag
        var script = document.createElement("script");
        script.type = "text/javascript";  
        script.id = ti_injection_id;
        script.innerHTML = ti_injection;
        script.async = true;
        //insertAfter - place the titanium script tag right after the current script tag
        script_tag=document.getElementsByTagName('script')[(document.getElementsByTagName('script').length-1)];
        script_tag.parentNode.insertBefore( script, script_tag.nextSibling );
    }
    else {
        alert("ti_injection not in page and not in localStorage");
    }
}
else {
    // save the titanium script tag
    localStorage.setItem("ti_injection", ti_injection.innerHTML);   
}
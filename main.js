var col=null;
var a=0;
document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
      col= document.getElementsByClassName("navbar-light")[0];
    }
}
window.addEventListener('scroll', function() {
    if(this.scrollY>300)
    {
        col.style.transition = "0.6s";
        col.style.backgroundColor="rgba(0,0,0,0.1)";
    }
    else
    {
        col.style.transition = "0.6s";
        col.style.backgroundColor="rgba(0,0,0,1)";
    }
});
// SLIDER START 
let flag = 0;
let lastKnownScrollPosition = 0;
let ticking = false;

let btn0 = document.getElementById("c-0");
let btn1 = document.getElementById("c-1");
let btn2 = document.getElementById("c-2");
let btn3 = document.getElementById("c-3");

    function controller(x){
            flag = flag + x; 
            slideshow(flag);
        }

    slideshow(flag);

    function slideshow(num){
            let slides = document.getElementsByClassName('slide');
        flag=num;
        if(num == slides.length){
            flag = 0;
            num = 0;
        }
        if(num < 0){
            flag = slides.length-1;
            num = slides.length-1;
        }

        for(let y of slides){
           y.style.display = "none";
        }
        slides[num].style.display = "block";
        
        if(flag==0){
            btn0.innerText = "🟡";
            btn1.innerText = "○";
            btn2.innerText = "○";
            btn3.innerText = "○";
        }

        else if(flag==1){
            btn1.innerText = "🟡";
            btn0.innerText = "○";
            btn2.innerText = "○";
            btn3.innerText = "○";
        }

        else if(flag==2){
            btn2.innerText = "🟡";
            btn1.innerText = "○";
            btn0.innerText = "○";
            btn3.innerText = "○";
        }

        else if(flag==3){
            btn3.innerText = "🟡";
            btn1.innerText = "○";
            btn2.innerText = "○";
            btn0.innerText = "○";
        }
    }

    window.setInterval(function(){
       controller(1);
      }, 6000);
// SLIDER END 

// NAVBAR START 
var bar = document.getElementsByClassName("navbar")[0];
var drop = document.getElementsByClassName("dropdown-menu")[0];
var defColor = bar.style.backgroundColor;
window.addEventListener('scroll', function() {

    if(this.screen.width <= 420)
    {
        navTransition(310);
    }
    else if(this.screen.width <= 576)
    {
        navTransition(325);
    }
    else if(this.screen.width <= 768)
    {
        navTransition(380);
    }
    else if(this.screen.width <= 992)
    {
        navTransition(550);
    }
    else if(this.screen.width <= 1200)
    {
        navTransition(610);
    }
    else
    {
        navTransition(680);
    }
});

function navTransition(dist){
    if(this.scrollY> dist)
    {
        bar.style.transition = "0.6s";
        bar.style.backgroundColor ="black";
        drop.style.transition = "0.6s";
        drop.style.backgroundColor ="black";
    }
    else
    {
        bar.style.transition = "0.6s";
        bar.style.backgroundColor =defColor;
        drop.style.transition = "0.6s";
        drop.style.backgroundColor =defColor;
    }
 }

// NAVBAR END 

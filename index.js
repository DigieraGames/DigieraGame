// SLIDER START 
const homeSwiper = new Swiper('.home-swiper', {
    loop: true,
    grabCursor: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
  });  
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
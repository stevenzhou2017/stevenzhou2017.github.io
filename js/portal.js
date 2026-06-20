document.addEventListener("DOMContentLoaded",()=>{

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
        anchor.addEventListener("click",function(e){
            e.preventDefault();
            document.querySelector(this.getAttribute("href")) ?.scrollIntoView({ behavior:"smooth"});
        });

     });

    // Highlight Current Menu
    const path=location.pathname;
    document.querySelectorAll("nav a").forEach(a=>{
        if(a.getAttribute("href")==path){
            a.classList.add("active");
        }
    });

    // Back To Top
    const btn=document.getElementById("backTop");
    if(btn){
        window.addEventListener("scroll",()=>{
            btn.style.display = window.scrollY>500?"block":"none";
        });

        btn.onclick=()=>{
            window.scrollTo({top:0, behavior:"smooth"});
        };
    }
});

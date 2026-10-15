(function(){
  document.documentElement.classList.add("js");
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets=Array.prototype.slice.call(document.querySelectorAll("section:not(.hero):not(.hero-band) .wrap > :not(.ring)"));
  if(reduced||!("IntersectionObserver" in window)){
    targets.forEach(function(el){el.classList.add("is-visible");});
    return;
  }
  targets.forEach(function(el){el.classList.add("fade-scroll");});
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },{rootMargin:"0px 0px -8%",threshold:.08});
  targets.forEach(function(el){observer.observe(el);});
})();

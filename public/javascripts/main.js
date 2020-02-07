"use strict";
{
  const container = document.querySelector(".container");
  container.addEventListener("dblclick", () => {
    document.location = "/";
  });

  var tapCount = 0 ;

  container.addEventListener("touchstart", (e) => {
    // シングルタップ判定
    if( !tapCount ) {
      ++tapCount ;
  
      setTimeout( () => {
        tapCount = 0 ;
      }, 350 ) ;
  
    // ダブルタップ判定
    } else {
      e.preventDefault() ;
      document.location = "/";
      tapCount = 0 ;
    }
  });
}
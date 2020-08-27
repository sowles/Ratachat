

document.addEventListener("DOMContentLoaded", function() {

  window.addEventListener("load", function() {
    function rand(min, max) {
      let ranNum = Math.random() * (max - min) + min;
      return Math.floor(ranNum);
      console.log(1)
    }
    document.getElementById('randomNum').value = rand(10, 20)

  });
  });

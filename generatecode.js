

document.addEventListener("DOMContentLoaded", function() {

  window.addEventListener("load", function() {
    function rand(min, max) {
      let randomNum = Math.random() * (max - min) + min;
      return Math.floor(randomNum);
    }
    document.getElementById('ranNum').value = rand(10, 20)

  });
  });

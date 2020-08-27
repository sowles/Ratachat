

document.addEventListener("DOMContentLoaded", function() {

  window.addEventListener("load", function() {
    function rand(min, max) {
      let ranNum = Math.random() * (max - min) + min;
      return Math.floor(ranNum);
    }
    document.getElementById('ranNum').value = rand(10, 20)

  });
  });

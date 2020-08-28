function randomCode(min, max) {
  let ranNum = Math.random() * (max - min) + min;
  return Math.floor(ranNum);
}
document.getElementById('randomNum').textContent = randomCode(100,999);

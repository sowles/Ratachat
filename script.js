function changeMainViews(view) {
  document.querySelectorAll(".main .main__section").forEach((el) => {
    el.classList.add("main__section--hidden");
  })
  document.querySelector(`.main .main__section.main__${view}`).classList.remove("main__section--hidden");
}

document.querySelector(".button[data-action='create']").addEventListener("click", () => {
  changeMainViews("create")
});

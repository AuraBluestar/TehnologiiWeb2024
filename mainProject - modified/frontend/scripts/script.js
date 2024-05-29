 /*Buton menu side bar*/
 let btn = document.querySelector('#btn');
 let sidebar = document.querySelector('.sidebar');

 btn.onclick = function () {
   sidebar.classList.toggle('active');
 };


 /*dropDown menu selector*/
 const optionMenu = document.querySelector(".dropdown"),
   selectBtn = optionMenu.querySelector(".selectbtn"),
   options = optionMenu.querySelectorAll(".option"),
   sBtn_text = optionMenu.querySelector(".sBtn-text");

 selectBtn.addEventListener("click", () => optionMenu.classList.toggle("active"));

 options.forEach(option => {
   option.addEventListener("click", () => {
     let selectedOption = option.querySelector(".option-text").innerText;
     sBtn_text.innerText = selectedOption;
     optionMenu.classList.remove("active");
   });
 });



 
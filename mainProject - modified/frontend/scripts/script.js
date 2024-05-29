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

 // Funcție pentru a converti valoarea dificultății în cuvinte corespunzătoare
 function getDifficultyText(difficulty) {
  switch (difficulty) {
    case 0:
      return "Easy";
    case 1:
      return "Medium";
    case 2:
      return "Hard";
    default:
      return "Unknown";
  }
}

// Funcție pentru a încărca și afișa lista de probleme din fișierul JSON
function loadProblems(problems) {
  const problemsContainer = document.querySelector('.ProblemsPage');
  problemsContainer.innerHTML = ''; // Clear the container before inserting new elements
  problems.forEach(problem => {
    const problemElement = `
      <div class="problem">
        <h2 class="problem-name">${problem.Titlu}</h2>
        <p class="problem-id"><strong>ID:</strong> ${problem.ID}</p>
        <p class="problem-category"><strong>Category:</strong> ${problem.Capitol}</p>
        <p class="problem-difficulty"><strong>Difficulty:</strong> ${getDifficultyText(problem.Dificultate)}</p>
        <p class="problem-description">${problem.Descriere}</p>
      </div>
    `;
    problemsContainer.insertAdjacentHTML('beforeend', problemElement);
  });
}

// Funcție pentru a trimite cererea POST la server și a încărca problemele filtrate
function searchProblems(event) {
  event.preventDefault();

  const text = document.querySelector('.search-input').value;
  const difficulty = document.querySelector('input[name="diffButtons"]:checked').value;
  const category = selectBtn.dataset.value || 'all';

  const searchParams = {
    text: text,
    difficulty: difficulty,
    category: category
  };

  fetch('http://localhost:3000/problems/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchParams)
  })
    .then(response => response.json())
    .then(data => {
      loadProblems(data);
    })
    .catch(error => console.error('Error loading problems:', error));
}

// Adăugăm event listener la formularul de filtrare
document.getElementById('filtermenu').addEventListener('submit', searchProblems);

// Apelăm funcția pentru a încărca și afișa lista de probleme la încărcarea paginii
window.onload = function() {
  // Încarcăm problemele inițiale (toate problemele)
  fetch('http://localhost:3000/problems/all', {
    method: 'POST',
  })
  .then(response => response.json())
  .then(data => {
    loadProblems(data);
  })
  .catch(error => console.error('Error loading problems:', error));
};

 
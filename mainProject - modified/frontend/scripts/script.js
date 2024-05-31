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
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
}

function getDifficultyColor(difficulty) {
  switch (difficulty) {
      case 1:
          return 'green';
      case 2:
          return 'orange';
      case 3:
          return 'red';
      default:
          return 'black';
  }
}

// Funcție pentru a încărca și afișa lista de probleme din fișierul JSON
function loadProblems(problems) {
  const problemsContainer = document.querySelector('.ProblemsPage');
  problemsContainer.innerHTML = ''; // Clear the container before inserting new elements
  problems.forEach(problem => {
    const problemElement = `
      <div class="problem" data-id="${problem.ID}" style="cursor: pointer;">
        <!-- Details section -->
        <div class="details">
            <!-- ID and Name -->
            <div class="id-name">
                <p class="problem-id"><strong>#</strong>${problem.ID}</p>
                <p class="problem-name">${problem.Titlu}</h2>
            </div>
            <!-- Category and Difficulty -->
            <div class="category-diff">
                <p class="problem-category">${problem.Capitol}</p>
                <p class="problem-diff" style="color: ${getDifficultyColor(problem.Dificultate)} ;">${getDifficultyText(problem.Dificultate)}</p>
            </div>
        </div>
        <!-- Description section -->
        <div class="description">
            <p class="problem-description">${problem.Descriere}</p>
        </div>
      </div>
    `;
    problemsContainer.insertAdjacentHTML('beforeend', problemElement);
  });

  // Add click event listener to each problem element
  document.querySelectorAll('.problem').forEach(problemElement => {
    problemElement.addEventListener('click', () => {
      const problemId = problemElement.dataset.id;
      window.location.href = `VisProblemGuest.html?problemId=${problemId}`;
    });
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

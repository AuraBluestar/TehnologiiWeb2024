document.addEventListener("DOMContentLoaded", function () {
    // Fetch groups and subjects
    fetch("http://localhost:3000/classes/all/Teacher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profesorID: 8 }), // Replace with dynamic ID if needed
    })
      .then((response) => response.json())
      .then((data) => {
        const dropdown = document.getElementById("groupDropdown");
  
        data.forEach((item) => {
          const li = document.createElement("li");
          li.classList.add("option");
          li.textContent = `${item.Grupa}-${item.Materie}`;
          li.setAttribute("data-value", item.Id);
          dropdown.appendChild(li);
        });
  
        const options = document.querySelectorAll(".option");
  
        options.forEach((option) => {
          option.addEventListener("click", function () {
            const selectBtn = document.querySelector(".selectbtn");
            const sBtn_text = document.querySelector(".sBtn-text");
            sBtn_text.innerText = this.innerText;
            selectBtn.setAttribute("data-value", this.getAttribute("data-value"));
            dropdown.classList.remove("open");
          });
        });
  
        document.querySelector(".selectbtn").addEventListener("click", function () {
          dropdown.classList.toggle("open");
        });
      })
      .catch((error) => {
        console.error("Error fetching groups and subjects:", error);
      });
  
    // Handle form submission for creating homework
    document.getElementById("createHomeworkForm").addEventListener("submit", function (event) {
      event.preventDefault();
  
      const selectBtn = document.querySelector(".selectbtn");
      const clasaId = selectBtn.getAttribute("data-value");
      const profesorId = localStorage.getItem("id");
  
      if (!clasaId || !profesorId) {
        alert("Please select a group and ensure you are logged in.");
        return;
      }
  
      const requestBody = JSON.stringify({
        ClasaID: parseInt(clasaId),
        ProfesorID: parseInt(profesorId),
      });
  
      fetch("http://localhost:3000/homework/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Homework created successfully!");
            localStorage.setItem("homeworkId", data.id); // Save homework ID to local storage
            document.getElementById("createHomeworkForm").reset();
            document.querySelector(".sBtn-text").innerText = "Select your option";
          } else {
            alert("Failed to create homework");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error creating homework");
        });
    });
  
    // Handle adding problem to homework
    document.getElementById("addProblemButton").addEventListener("click", function () {
      const problemId = document.getElementById("problemIdInput").value;
      const homeworkId = localStorage.getItem("homeworkId");
  
      if (!problemId || !homeworkId) {
        alert("Please enter a valid problem ID and ensure a homework is created.");
        return;
      }
  
      const requestBody = JSON.stringify({
        HomeworkID: parseInt(homeworkId),
        ProblemID: parseInt(problemId),
      });
  
      fetch("http://localhost:3000/homework/addProblem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const addedProblemsList = document.getElementById("addedProblemsList");
            const li = document.createElement("li");
            li.textContent = problemId;
            addedProblemsList.appendChild(li);
            document.getElementById("problemIdInput").value = ""; // Clear the input field
            alert("Problem added to homework successfully!");
          } else {
            alert("Failed to add problem to homework");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error adding problem to homework");
        });
    });
  });
  
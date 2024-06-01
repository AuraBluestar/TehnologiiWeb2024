document.addEventListener('DOMContentLoaded', function () {
    // Fetch groups and populate dropdown
    fetchGroups();

    // Dropdown menu functionality
    const selectBtn = document.querySelector(".selectbtn");
    const optionMenu = document.querySelector(".dropdown");
    const sBtn_text = selectBtn.querySelector(".sBtn-text");

    selectBtn.addEventListener("click", () => optionMenu.classList.toggle("active"));

    // Event delegation for dynamically added options
    document.getElementById('groupDropdown').addEventListener('click', function (event) {
        if (event.target && event.target.matches(".option")) {
            let selectedOption = event.target.querySelector(".option-text").innerText;
            let selectedValue = event.target.getAttribute("data-value");
            sBtn_text.innerText = selectedOption;
            optionMenu.classList.remove("active");
            selectBtn.setAttribute("data-value", selectedValue); // Set the selected value
        }
    });

    // Handle form submission for creating homework
    document.getElementById('createHomeworkForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const clasaId = selectBtn.getAttribute("data-value");
        const profesorId = localStorage.getItem('id'); // Assuming the ID is stored in localStorage

        if (!clasaId || !profesorId) {
            alert('Please select a group and ensure you are logged in.');
            return;
        }

        const requestBody = JSON.stringify({
            ClasaID: parseInt(clasaId),
            ProfesorID: parseInt(profesorId)
        });

        fetch('http://localhost:3000/homework/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Homework created successfully!');
                localStorage.setItem('homeworkId', data.id); // Save homework ID to local storage
                document.getElementById('createHomeworkForm').reset();
                sBtn_text.innerText = "Select your option";
            } else {
                alert('Failed to create homework');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error creating homework');
        });
    });

    // Handle adding problem to homework
    document.getElementById('addProblemButton').addEventListener('click', function () {
        const problemId = document.getElementById('problemIdInput').value;
        const homeworkId = localStorage.getItem('homeworkId');

        if (!problemId || !homeworkId) {
            alert('Please enter a valid problem ID and ensure a homework is created.');
            return;
        }

        const requestBody = JSON.stringify({
            HomeworkID: parseInt(homeworkId),
            ProblemID: parseInt(problemId)
        });

        fetch('http://localhost:3000/homework/addProblem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const addedProblemsList = document.getElementById('addedProblemsList');
                const li = document.createElement('li');
                li.textContent = problemId;
                addedProblemsList.appendChild(li);
                document.getElementById('problemIdInput').value = ''; // Clear the input field
                alert('Problem added to homework successfully!');
            } else {
                alert('Failed to add problem to homework');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding problem to homework');
        });
    });
});

// Function to fetch groups from the server
function fetchGroups() {
    fetch('http://localhost:3000/classes/all/Teacher', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profesorID: localStorage.getItem('id') }) // Assuming the ID is stored in localStorage
    })
    .then(response => response.json())
    .then(data => {
        populateDropdown(data);
    })
    .catch(error => {
        console.error('Error fetching groups:', error);
    });
}

// Function to populate the dropdown menu with fetched groups (unique options only)
function populateDropdown(groups) {
    const groupDropdown = document.getElementById('groupDropdown');
    groupDropdown.innerHTML = ''; // Clear existing options

    // Create a Set to store unique group names
    const uniqueGroups = new Set(groups.map(group => group.Grupa));

    // Populate dropdown with unique group names
    uniqueGroups.forEach(groupName => {
        const option = document.createElement('li');
        option.innerHTML = `<span class="option-text">${groupName}</span>`;
        option.classList.add('option');
        option.dataset.value = groupName; // Store group value in dataset
        groupDropdown.appendChild(option);
    });
}

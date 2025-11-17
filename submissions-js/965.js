jQuery(document).ready(function ($) {
  const submissionNumber = '13868965';
  var currentStep;

  const statusDiv = $('<div></div>').css({
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px', // Adds space below the div
    color: '#333', // Optional styling for text color
    textAlign: 'center', // Center-align the text
    width: '100%' // Make sure the div takes full width
  });


  // Create a container for the grid
  const gridContainer = $('<div id="submission-status-grid"></div>').css({
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)', // 8 equal columns
    gap: '10px', // Space between items
    padding: '10px', // Padding for the container
    border: '1px solid #ddd', // Optional border
    borderRadius: '5px', // Optional rounded corners
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Optional shadow

  });

  // Create a legend for the grid colors
  const legendDiv = $('<div class="legend"></div>').css({
    padding: '10px',
    marginTop: '15px',
    fontSize: '14px', // Smaller font size
  }).html(`
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="background-color: #3FA9F3;  color:white;">Blue</span>
            <span>&nbsp; - Completed steps</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="background-color: #fff70099;">Yellow</span>
            <span>&nbsp; - In progress</span>
        </div>
        <div style="display: flex; align-items: center;">
            <span>White - Pending steps</span>
        </div>
    `);

  const getSubmissionStatus = (submissionNumber) => {
    $.ajax({
      url: `https://api.psacard.com/publicapi/order/GetSubmissionProgress/${submissionNumber}`,
      method: 'GET',
      headers: {
        'Authorization': 'bearer 1oPf1WwogPfhdzo_7EoDW3g9SzvlaCEQXxnius6vjZsI7Vown7wJ2glbRb_7yHI75W4M0L-wE0eRw1yr74ZHnh5E5CCLt90-O1jBjLugLhOYLIPeBt0illfQsmDjpgfmjD-vxYQrKEW25KpUm4scl0Ld6I_3mtO1RLOqaExR_K6EVHeoUUNf2JnbkpGjVGzHuAMoqGgU9QnzZ7buJA693jalrwZTTnTPqbgaNxFFEFo5X77rauk-JnK78LDYexMHA9e4oekDODLJUzAmii5xSuWY1rsI-dMARgFZSCZG-XX48Bo7'
      },
      success: function (response) {
        const { orderProgressSteps } = response;

        // Clear previous results
        gridContainer.empty();

        // Ensure we only display up to 8 steps
        const stepsToDisplay = orderProgressSteps.slice(0, 8);

        let firstNoFound = false; // Track if the first "No" has been found

        // Parse the steps and add them to the grid
        stepsToDisplay.forEach(step => {
          const isCompleted = step.completed;
          if (step.step === "OrderPrep") {
            step.step = "Order Prep"
          }
          if (step.step === "ResearchAndID") {
            step.step = "Research and ID"
          }
          if (step.step === "QACheck1") {
            step.step = "QA Check"
          }
          if (step.step === "QACheck2") {
            step.step = "Awaiting Grades"
          }

          const stepDiv = $('<div></div>').css({
            background: isCompleted ? '#3FA9F3' : (firstNoFound ? 'white' : '#fff70099'), // Yellow for first No, otherwise white
            color: isCompleted ? 'white' : 'black', // Change text color for better contrast
            padding: '5px', // Padding for items
            border: '1px solid #ccc', // Border around items
            borderRadius: '4px', // Rounded corners
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Shadow for items
            fontSize: '14px', // Smaller font size
            textAlign: 'center', // Center text
          });

          // If the step is not completed and it is "qacheck2"
          if (isCompleted && step.step === 'Awaiting Grades' && !firstNoFound) {
            stepDiv.css('background', '#3FA9F3'); // Set background to blue
            stepDiv.css('color', 'white'); // Set background to blue
            //firstNoFound = true; // Mark that the first "No" has been found
          } else if (!isCompleted && !firstNoFound) {
            stepDiv.css('background', '#fff70099'); // Set background to yellow for first "No"
            firstNoFound = true; // Mark that the first "No" has been found
            currentStep = step.step;
          } else if (!isCompleted) {
            stepDiv.css('background', 'white'); // Set background to white for subsequent "No"
          }

          stepDiv.append(`<strong>${step.step}</strong><br>`);
          // stepDiv.append(`Completed: ${isCompleted ? 'Yes' : 'No'}`);
          gridContainer.append(stepDiv);
        });
        if (currentStep === "Research and ID") {
          statusDiv.text(`Your submission is being researched so each item can be correctly identified on the PSA label.`);
        } else if (currentStep === "Grading") {
          statusDiv.text(`Your submission is going through the authentication and grading process.`);
        } else if (currentStep === "Assembly") {
          statusDiv.text(`PSA labels will be printed, and each eligible item will be sonically sealed within a PSA holder.`);
        } else if (currentStep === "QA Check") {
          statusDiv.text(`Your grades will be reviewed a second time for accuracy.`);
        } else if (currentStep == "Awaiting Grades") {
          statusDiv.text(`Labels are being reviewed and the slab is examined for defects.`);
        } else if (currentStep === "Shipped") {
          statusDiv.html(`Congratulations - Your grades are ready and will be shipped shortly! Please look for an email from crackedicecards@gmail.com to pay your invoice.<br>If you would like to see your grades, email us and we'll send them right away.<br>Please note that payment is required prior to seeing grades.`);
        } else { statusDiv.html(`Congratulations - Your order has shipped! Please look for an email from crackedicecards@gmail.com to pay your invoice.<br>If you would like to see your grades, email us and we'll send them right away.<br>Please note that payment is required prior to seeing grades.`); }
      },
      error: function (error) {
        //console.error('Error retrieving the PSA submission.');
        let div = document.getElementById('submission-status-grid');
        div.style.gridTemplateColumns = 'repeat(1, 1fr)';

        gridContainer.append('<div style="text-align: center; color: black">Your PSA order has been successfully delivered to PSA; however, it has not been entered into their system yet. Please note the PSA receiving process is currently taking approximately 3-4 weeks. If you have any questions, please do not hesitate to <a href="mailto:crackedicecards@gmail.com">contact us</a> and thanks for using Cracked Ice Cards as your trusted middleman to PSA.</div>');
      }
    });
  };

  // Function to apply styles based on screen size
  function updateGridColumns() {
    if (window.matchMedia('(max-width: 600px)').matches) {
      // For small screens (e.g., mobile)
      gridContainer.css('gridTemplateColumns', 'repeat(1, 1fr)'); // 2 columns
    } else if (window.matchMedia('(max-width: 900px)').matches) {
      // For medium screens (e.g., tablets)
      gridContainer.css('gridTemplateColumns', 'repeat(1, 1fr)'); // 4 columns
    } else {
      // For large screens (default)
      gridContainer.css('gridTemplateColumns', 'repeat(8, 1fr)'); // 8 columns
    }
  }

  function displayDateTime() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, options);

    const h3Element = document.getElementById('displayDate');
    h3Element.innerHTML += ` ${dateString}`;
  }

  // Listen for screen size changes and update styles accordingly
  $(window).resize(updateGridColumns);

  // Initial call to apply styles based on the current screen size
  updateGridColumns();

  // Call the function to display date and time
  displayDateTime();

  // Initial call to get the submission status
  getSubmissionStatus(submissionNumber);

  // Append the grid container to the body or a specific element
  $('#progressList').append(statusDiv).append(gridContainer).append(legendDiv);
});

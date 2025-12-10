
    // JavaScript to handle click events and navigate to URLs
    document.getElementById("option1").addEventListener("click", function() {
        window.location.href = "index.html"; // Replace with your URL for Option 1
    });

    document.getElementById("option2").addEventListener("click", function() {
        window.location.href = "informatiom.html"; // Replace with your URL for Option 2
    });

    
  // Function to handle logout and prevent going back
  function logout() {
    // Perform logout actions (clear session, user data, etc.)
    // For demonstration, let's just clear a session storage item
    sessionStorage.removeItem('isLoggedIn');

    // Go back to the previous page in the browsing history
    window.history.back();
  }

  // Push a new state to the history stack when the page loads
  window.onload = function() {
    history.pushState(null, null, window.location.href);
  
document.addEventListener("DOMContentLoaded", function() {
  // Get all elements with the class "textarea"
  var textareas = document.getElementsByClassName("textarea");

  // Add a click event listener to each textarea
  for (var i = 0; i < textareas.length; i++) {
    textareas[i].addEventListener("click", function() {
      // Get the value of the clicked textarea
      var originalText = this.value;

      // Copy the text to the clipboard
      navigator.clipboard.writeText(originalText).then(function() {
        // Use the Share API to share the copied data
        var shareData = {
          title: "Share Data",
          text: originalText,
        };

        if (navigator.share) {
          navigator.share(shareData)
            .then(function() {
              alert("Data shared successfully!");
            })
            .catch(function(error) {
              console.error("Share failed:", error);
            });
        } else {
          alert("Data copied to clipboard, but the Share API is not available.");
        }
      }).catch(function(err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });

function validateForm() {
	console.log("validating");
    var x = document.forms["update-course"]["title"].value;
    if (x == "") {
        alert("Name must be filled out");
        return false;
    }
	return true;
}
function searchCoursesByTopic(){
	var id = document.getElementById('searchInput').value;
	console.log(id.value);
	window.location = '/course/search/' + encodeURI(id);
};


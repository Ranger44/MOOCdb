function updateCourseLanguage(id){
	//console.log("within updateTopic()");
    $.ajax({
        url: '/course_language/' + id,
        type: 'PUT',
        data: $('#update-courseLanguage').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
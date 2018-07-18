function updateCourseTopic(id){
	//console.log("within updateTopic()");
    $.ajax({
        url: '/course_topic/' + id,
        type: 'PUT',
        data: $('#update-courseTopic').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
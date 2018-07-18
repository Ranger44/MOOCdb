function updateTopic(id){
	console.log("within updateTopic()");
    $.ajax({
        url: '/topic/' + id,
        type: 'PUT',
        data: $('#update-topic').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

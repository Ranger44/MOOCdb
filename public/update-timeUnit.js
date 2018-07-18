function updateTimeUnit(id){
	//console.log("within updateTopic()");
    $.ajax({
        url: '/timeUnit/' + id,
        type: 'PUT',
        data: $('#update-timeUnit').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

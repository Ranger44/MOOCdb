function updateCompany(id){
	//console.log("within updateTopic()");
    $.ajax({
        url: '/company/' + id,
        type: 'PUT',
        data: $('#update-company').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function updatelanguage(id){
	console.log("within updateLanguage()");
    $.ajax({
        url: '/language/' + id,
        type: 'PUT',
        data: $('#update-language').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

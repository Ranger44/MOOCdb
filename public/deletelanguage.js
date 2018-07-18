function deleteLanguage(id){
    $.ajax({
        url: '/language/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
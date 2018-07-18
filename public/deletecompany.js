function deleteCompany(id){
    $.ajax({
        url: '/company/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
function deleteTopic(id){
    $.ajax({
        url: '/topic/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
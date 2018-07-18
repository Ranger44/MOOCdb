function deleteTimeUnit(id){
    $.ajax({
        url: '/timeUnit/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
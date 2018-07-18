function deleteCourse(id){
    $.ajax({
        url: '/course/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};



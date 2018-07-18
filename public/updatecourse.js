function updateCourse(id){
    $.ajax({
        url: '/course/' + id,
        type: 'PUT',
        data: $('#update-course').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

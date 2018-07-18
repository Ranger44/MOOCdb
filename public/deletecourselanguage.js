function deleteCourseLanguage(course_id, id){
  $.ajax({
      url: '/course_language/course_id/' + course_id + '/language/' + id,
      type: 'DELETE',
      success: function(result){
          if(result.responseText != undefined){
            alert(result.responseText)
          }
          else {
            window.location.reload(true)
          } 
      }
  })
};
function deleteCourseTopic(course_id, id){
  $.ajax({
      url: '/course_topic/course_id/' + course_id + '/topic/' + id,
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
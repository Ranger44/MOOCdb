module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* get courses to populate in dropdown */
    function getCourses(res, mysql, context, complete){
        mysql.pool.query("SELECT course_id, title FROM md_course", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.course2 = results;
            complete();
        });
    }

    /* get topics to populate in dropdown */
    function getTopics(res, mysql, context, complete){
        sql = "SELECT id, name FROM md_topic";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end()
            }
            context.topic2 = results
            complete();
        });
    }

    /* get courses with their topics */
    /* TODO: get multiple topics in a single column and group on
     * fname+lname or id column
     */
    function getCoursesWithTopics(res, mysql, context, complete){
		//console.log("within getCourseswithTopics");
        sql = "SELECT CT.id AS id, C.title AS course, T.name AS topic, C.course_id AS cid, T.id AS tid FROM md_course_topic CT INNER JOIN md_course C ON C.course_id = CT.course_id INNER JOIN md_topic T ON T.id = CT.topic_id";
         mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end()
            }
            context.course_with_topic = results
            complete();
        });
    }
	
	function getOneCourseTopic(res, mysql, context, id, complete){
		console.log(id);
        var sql = "SELECT CT.id AS id, CT.course_id AS course_id, CT.topic_id AS topic_id, C.title AS title, T.name AS name FROM md_course_topic CT JOIN md_course C ON C.course_id = CT.course_id JOIN md_topic T ON T.id = CT.topic_id WHERE CT.id=?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneCourseTopic = results[0];  //returns list of one topic
            complete();
        });
    }
  

    /* List courses with Topics along with 
     * displaying a form to associate a course with multiple Topics
     */
    router.get('/', function(req, res){
		//console.log("within router '/'");
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecoursetopic.js"];
        var mysql = req.app.get('mysql');
        var handlebars_file = 'course_topic'
        getCourses(res, mysql, context, complete);
        getTopics(res, mysql, context, complete);
        getCoursesWithTopics(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render(handlebars_file, context);
            }
        }
    });
	
	router.get('/:id', function(req, res){
		console.log("within id router");
		console.log(req.params.id);
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update-courseTopic.js", "selectedcourse.js", "selectedtopic.js"];
        var mysql = req.app.get('mysql');
		//console.log(req.params.id, mysql);
        getOneCourseTopic(res, mysql, context, req.params.id, complete);
        getTopics(res, mysql, context, complete);
		getCourses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-courseTopic', context);
            }

        }
    });

    /* Associate topics or topics with a course and 
     * then redirect to the courses_with_topics page after adding 
     */
    router.post('/', function(req, res){
        //console.log("We get the multi-select certificate dropdown as ", req.body.topics)
        var mysql = req.app.get('mysql');
        // let's get out the certificates from the array that was submitted by the form 
        var newTopics = req.body.topics
        var newCourse = req.body.cid
        for (let aTopic of newTopics) {
          //console.log("Processing certificate id " + aTopic)
          var sql = "INSERT INTO md_course_topic (course_id, topic_id) VALUES (?,?)";
          var inserts = [newCourse, aTopic];
          sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                //TODO: send error messages to frontend as the following doesn't work
                /* 
                res.write(JSON.stringify(error));
                res.end();
                */
                console.log(error)
            }
          });
        } //for loop ends here 
        res.redirect('/course_topic');
    });

	router.post('/:id', function(req, res){
        //console.log("We get the multi-select certificate dropdown as ", req.body.topics)
        var mysql = req.app.get('mysql');
        // let's get out the certificates from the array that was submitted by the form 
        var newTopics = req.body.topics
        var newCourse = req.body.cid
        for (let aTopic of newTopics) {
          //console.log("Processing certificate id " + aTopic)
          var sql = "UPDATE md_course_topic SET course_id=?, topic_id=? WHERE course_id=? AND topic_id=?";
          var inserts = [newCourse, aTopic];
          sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                //TODO: send error messages to frontend as the following doesn't work
                /* 
                res.write(JSON.stringify(error));
                res.end();
                */
                console.log(error)
            }
          });
        } //for loop ends here 
        res.redirect('/course_topic');
    });
	
	router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_course_topic SET course_id=?, topic_id=? WHERE id=?";
        var inserts = [req.body.course_selected, req.body.topic_selected, req.params.id];
		console.log(req.body.course_selected, req.body.topic_selected, req.params.id);
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });
	
    /* Delete a course's certification record */
    /* This route will accept a HTTP DELETE request in the form
     * /pid/{{pid}}/cert/{{cid}} -- which is sent by the AJAX form 
     */
    router.delete('/course_id/:course_id/topic/:topic_id', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        //console.log(req.params.course_id)
        //console.log(req.params.topic_id)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM md_course_topic WHERE course_id = ? AND topic_id = ?";
        var inserts = [req.params.course_id, req.params.topic_id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400); 
                res.end(); 
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();

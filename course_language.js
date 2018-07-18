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
            context.course3 = results;
            complete();
        });
    }

    /* get languages to populate in dropdown */
    function getLanguages(res, mysql, context, complete){
        sql = "SELECT id, name FROM md_language";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.language2 = results;
            complete();
        });
    }

    /* get courses with their languages */
    function getCoursesWithLanguages(res, mysql, context, complete){
		//console.log("within getCourseswithTopics");
        sql = "SELECT CL.id AS id, C.title AS course, L.name AS language, C.course_id, L.id AS lid FROM md_course_language CL INNER JOIN md_course C ON C.course_id = CL.course_id INNER JOIN md_language L ON L.id = CL.language_id";
         mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.course_with_language = results;
            complete();
        });
    }
	
	function getOneCourseLanguage(res, mysql, context, id, complete){
		console.log(id);
        var sql = "SELECT CL.id AS id, CL.course_id AS course_id, CL.language_id AS language_id, C.title AS title, L.name AS name FROM md_course_language CL JOIN md_course C ON C.course_id = CL.course_id JOIN md_language L ON L.id = CL.language_id WHERE CL.id=?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneCourseLanguage = results[0];  //returns list of one language
            complete();
        });
    }
  

    /* List courses with languages along with 
     * displaying a form to associate a course with multiple languages
     */
    router.get('/', function(req, res){
		//console.log("within router '/'");
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecourselanguage.js"];
        var mysql = req.app.get('mysql');
        var handlebars_file = 'course_language'
        getCourses(res, mysql, context, complete);
        getLanguages(res, mysql, context, complete);
        getCoursesWithLanguages(res, mysql, context, complete);
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
        context.jsscripts = ["update-courseLanguage.js", "selectedcourse.js", "selectedlanguage.js"];
        var mysql = req.app.get('mysql');
		//console.log(req.params.id, mysql);
        getOneCourseLanguage(res, mysql, context, req.params.id, complete);
        getLanguages(res, mysql, context, complete);
		getCourses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-courseLanguage', context);
            }

        }
    });

    /* Associate languages or languages with a course and 
     * then redirect to the courses_with_languages page after adding 
     */
    router.post('/', function(req, res){
        //console.log("We get the multi-select certificate dropdown as ", req.body.languages)
        var mysql = req.app.get('mysql');
        // let's get out the certificates from the array that was submitted by the form 
        var newLanguages = req.body.languages
        var newCourse = req.body.cid
        for (let aLanguage of newLanguages) {
          //console.log("Processing certificate id " + aTopic)
          var sql = "INSERT INTO md_course_language (course_id, language_id) VALUES (?,?)";
          var inserts = [newCourse, aLanguage];
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
        res.redirect('/course_language');
    });
	
	router.post('/:id', function(req, res){
        console.log("We get the multi-select certificate dropdown as ", req.body.languages)
        var mysql = req.app.get('mysql');
        // let's get out the certificates from the array that was submitted by the form 
        var newLanguages = req.body.languages
        var newCourse = req.body.cid
        for (let aLanguage of newLanguages) {
          //console.log("Processing certificate id " + aTopic)
          var sql = "UPDATE md_course_language SET course_id=?, language_id=? WHERE course_id=? AND language_id=?";
          var inserts = [newCourse, aLanguage];
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
        res.redirect('/course_language');
    });
	
	router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_course_language SET course_id=?, language_id=? WHERE id=?";
        var inserts = [req.body.course_selected, req.body.language_selected, req.params.id];
		console.log(req.body.course_selected, req.body.language_selected, req.params.id);
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
    router.delete('/course_id/:course_id/language/:language_id', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        //console.log(req.params.course_id)
        //console.log(req.params.language_id)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM md_course_language WHERE course_id = ? AND language_id = ?";
        var inserts = [req.params.course_id, req.params.language_id];
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

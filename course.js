module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getCompany(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM md_company", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.company  = results;
            complete();
        });
    }

    function getCourses(res, mysql, context, complete){
        mysql.pool.query("SELECT course_id, title, C1.name AS provider, C2.name AS creator, md_course.url, lengthInt, md_timeUnit.name AS timeUnit FROM md_course INNER JOIN md_company C1 ON md_course.provider = C1.id INNER JOIN md_company C2 ON md_course.creator = C2.id INNER JOIN md_timeUnit ON md_course.timeUnit = md_timeUnit.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.course = results;
            complete();
        });
    }
	
	function getUnits(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM md_timeUnit", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.units  = results;
            complete();
        });
    }
	
	function getOneCourse(res, mysql, context, id, complete){
        var sql = "SELECT course_id, title, provider, creator, url, lengthInt, timeUnit FROM md_course WHERE course_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneCourse = results[0];  //returns list of one course
            complete();
        });
    }
	
	function getCoursesWithTopicsLike(req, res, mysql, context, complete){
        var query = "SELECT title, C1.name AS 'creator', C2.name AS 'creator', C.url, lengthInt, TU.name AS 'timeUnit' FROM md_course C INNER JOIN md_company C1 ON C.provider = C1.id INNER JOIN md_company C2 ON C.creator = C2.id INNER JOIN md_timeUnit TU ON C.timeUnit = TU.id INNER JOIN md_course_topic CT ON C.course_id = CT.course_id INNER JOIN md_topic T ON CT.topic_id = T.id WHERE T.name LIKE " + mysql.pool.escape('%' + req.params.searchInput + '%');
		console.log(query);
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.course = results;  //returns list of one course
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecourse.js", "searchcoursebytopic.js"];
        var mysql = req.app.get('mysql');
        getCourses(res, mysql, context, complete);
        getCompany(res, mysql, context, complete);
		getUnits(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('course', context);
            }

        }
    });

	router.get('/search/:searchInput', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecourse.js","searchcoursebytopic.js"];
        var mysql = req.app.get('mysql');
        getCoursesWithTopicsLike(req, res, mysql, context, complete);
        //getCourses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('course', context);
            }
        }
    });
	
    // Display one course for the specific purpose of updating md_course 

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcompany.js", "selectedunit.js", "updatecourse.js", "validateform.js"];
        var mysql = req.app.get('mysql');
        getOneCourse(res, mysql, context, req.params.id, complete);
        getCompany(res, mysql, context, complete);
		getUnits(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-course', context);
            }

        }
    });

    // Adds a course, redirects to the course page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO md_course (title, provider, creator, url, lengthInt, timeUnit) VALUES (?,?,?,?,?,?)";
        var inserts = [req.body.title, req.body.provider, req.body.creator, req.body.url, req.body.lengthInt, req.body.timeUnit];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/course');
            }
        });
    });

    /* The URI that update data is sent to in order to update a course */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_course SET title=?, provider=?, creator=?, url=?, lengthInt=?, timeUnit=? WHERE course_id=?";
        var inserts = [req.body.title, req.body.provider, req.body.creator, req.body.url, req.body.lengthInt, req.body.timeUnit, req.params.id];
		console.log(req.body.title, req.params.id);
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

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

	router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM md_course WHERE course_id = ?";
        var inserts = [req.params.id];
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

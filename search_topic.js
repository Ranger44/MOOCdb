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
	
	function getCoursesWithTopicsLike(req, res, mysql, context, complete){
        var query = "SELECT title, C1.name AS 'creator', C2.name AS 'creator', C.url, lengthInt, TU.name AS 'timeUnit' FROM md_course C INNER JOIN md_company C1 ON C.provider = C1.id INNER JOIN md_company C2 ON C.creator = C2.id INNER JOIN md_timeUnit TU ON C.timeUnit = TU.id INNER JOIN md_course_topic CT ON C.course_id = CT.course_id INNER JOIN md_topic T ON CT.topic_id = T.id WHERE T.name LIKE " + mysql.pool.escape('%' + req.params + '%');;
		console.log(query);
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.searchResult = results;  //returns list of one course
            complete();
        });
    }

    /*Display search results. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["searchcoursebytopic.js"];
        var mysql = req.app.get('mysql');
        getCourses(res, mysql, context, complete);
        getCompany(res, mysql, context, complete);
		getUnits(res, mysql, context, complete);
		console.log("req.body.searchInput:", req.body.searchInput);
		//getCoursesWithTopicLike(res, mysql, context, req.params.searchInput, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('search_topic', context);
            }

        }
    });
	
	//Display one person for the specific purpose of updating people 

    router.get('/:searchInput', function(req, res){
		console.log("within router.get /:searchinput");
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["searchcoursebytopic.js"];
        var mysql = req.app.get('mysql');
		console.log(req.params.searchInput);
		getCourses(res, mysql, context, complete);
        getCompany(res, mysql, context, complete);
		getUnits(res, mysql, context, complete);
		getCoursesWithTopicLike(res, mysql, context, req.params.searchInput, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('search-result', context);
            }
        }
    });
	
	    // Adds a language, redirects to the language page after adding */

    router.post('/:searchInput', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "SELECT title, C1.name AS 'provider', C2.name AS 'creator', C.url, lengthInt, TU.name AS 'timeUnit' FROM md_course C INNER JOIN md_company C1 ON C.provider = C1.id INNER JOIN md_company C2 ON C.creator = C2.id INNER JOIN md_timeUnit TU ON C.timeUnit = TU.id INNER JOIN md_course_topic CT ON C.course_id = CT.course_id INNER JOIN md_topic T ON CT.topic_id = T.id WHERE T.name LIKE CONCAT('%', ?, '%');";
        var inserts = [req.body.searchName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/' + req.body.searchInput);
            }
        });
    });

	    /* The URI that update data is sent to in order to update a language */
/*
    router.post('/:searchInput', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "SELECT title, C1.name AS 'Provider', C2.name AS 'Creator', C.url, lengthInt, TU.name AS 'Time Unit' FROM md_course C INNER JOIN md_company C1 ON C.provider = C1.id INNER JOIN md_company C2 ON C.creator = C2.id INNER JOIN md_timeUnit TU ON C.timeUnit = TU.id INNER JOIN md_course_topic CT ON C.course_id = CT.course_id INNER JOIN md_topic T ON CT.topic_id = T.id WHERE T.name LIKE CONCAT('%', ?, '%');";
		console.log("within URI", req.body.searchInput, req.params.searchInput);
        var inserts = [req.body.searchInput];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
			//console.log(error, results, fields);
            if(error){
				console.log("Error");
                res.write(JSON.stringify(error));
                res.end();
            }else{
				console.log("what's going on");
                res.status(200);
                res.end();
			   //res.redirect('/' + req.body.searchInput);
            }
        });
    });
	*/

    return router;
	
	
}();

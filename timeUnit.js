module.exports = function(){
    var express = require('express');
    var router = express.Router();
	
	function getUnits(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM md_timeUnit", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.timeUnit  = results;
            complete();
        });
    }
		
	function getOneTimeUnit(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM md_timeUnit WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneTimeUnit = results[0];  //returns list of one timeUnit
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletetimeunit.js"];
        var mysql = req.app.get('mysql');
        getUnits(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('timeUnit', context);
            }

        }
    });

	
    // Display one timeUnit for the specific purpose of updating md_timeUnit 

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcompany.js", "selectedunit.js", "updatetimeUnit.js"];
        var mysql = req.app.get('mysql');
        getOneTimeUnit(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-timeUnit', context);
            }

        }
    });

    // Adds a timeUnit, redirects to the timeUnit page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO md_timeUnit (name) VALUES (?)";
        var inserts = [req.body.name];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/timeUnit');
            }
        });
    });

    /* The URI that update data is sent to in order to update a timeUnit */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_timeUnit SET name=? WHERE id=?";
        var inserts = [req.body.name, req.params.id];
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
        var sql = "DELETE FROM md_timeUnit WHERE id = ?";
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

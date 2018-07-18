module.exports = function(){
    var express = require('express');
    var router = express.Router();
	
	//getCompanies for pull-down menus
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
	
	//get units for pull-down menu
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
	
    function getLanguages(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM md_language", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.language = results;
            complete();
        });
    }
		
	function getOneLanguage(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM md_language WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneLanguage = results[0];  //returns list of one language
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletelanguage.js"];
        var mysql = req.app.get('mysql');
        getLanguages(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('language', context);
            }

        }
    });

	
    // Display one language for the specific purpose of updating md_language 

    router.get('/:id', function(req, res){
		console.log("within id router");
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatelanguage.js"];
        var mysql = req.app.get('mysql');
		//console.log(req.params.id, mysql);
        getOneLanguage(res, mysql, context, req.params.id, complete);	
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-language', context);
            }

        }
    });

    // Adds a language, redirects to the language page after adding */

    router.post('/', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO md_language (name) VALUES (?)";
        var inserts = [req.body.name];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/language');
            }
        });
    });

    /* The URI that update data is sent to in order to update a language */

    router.put('/:id', function(req, res){
		console.log("within router.put/id");
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_language SET name=? WHERE id=?";
		console.log(req.body.name, req.params.id);
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
        var sql = "DELETE FROM md_language WHERE id = ?";
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

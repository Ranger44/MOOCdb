module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getCompanies(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, url FROM md_company", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.company1 = results;
            complete();
        });
    }
	
	function getOneCompany(res, mysql, context, id, complete){
        var sql = "SELECT id, name, url FROM md_company WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneCompany = results[0];  //returns list of one company
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecompany.js"];
        var mysql = req.app.get('mysql');
        getCompanies(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('company', context);
            }

        }
    });

	
    // Display one company for the specific purpose of updating md_company 

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatecompany.js"];
        var mysql = req.app.get('mysql');
        getOneCompany(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-company', context);
            }

        }
    });

    // Adds a company, redirects to the company page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO md_company (name, url) VALUES (?,?)";
        var inserts = [req.body.name, req.body.url];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/company');
            }
        });
    });

    /* The URI that update data is sent to in order to update a company */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_company SET name=?, url=? WHERE id=?";
        var inserts = [req.body.name, req.body.url, req.params.id];
		//console.log(req.body.name, req.body.url, req.params.id);
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
        var sql = "DELETE FROM md_company WHERE id = ?";
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

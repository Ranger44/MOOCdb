module.exports = function(){
    var express = require('express');
    var router = express.Router();
	
    function getTopics(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM md_topic", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.topic = results;
            complete();
        });
    }
		
	function getOneTopic(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM md_topic WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneTopic = results[0];  //returns list of one topic
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

	router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletetopic.js"];
        var mysql = req.app.get('mysql');
        getTopics(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){				//CHANGE IF FUNCTIONS BEING CALLED CHANGES!!
                res.render('topic', context);
            }

        }
    });

	
    // Display one topic for the specific purpose of updating md_topic 

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatetopic.js"];
        var mysql = req.app.get('mysql');
        getOneTopic(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-topic', context);
            }

        }
    });

    // Adds a topic, redirects to the topic page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO md_topic (name) VALUES (?)";
        var inserts = [req.body.name];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/topic');
            }
        });
    });

    /* The URI that update data is sent to in order to update a topic */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE md_topic SET name=? WHERE id=?";
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
        var sql = "DELETE FROM md_topic WHERE id = ?";
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

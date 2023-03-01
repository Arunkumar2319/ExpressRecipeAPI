var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors');

let data = []

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Default route

app.get('/', function(req,res){
	return res.send({error: true, message: 'hello'})
});

// DB config

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root123",
	database: "recipedb"
});

// Db connect

con.connect();

// Retrive all data
// app.use(cors({origin: 'http://localhost:8080'}));


app.use(cors());
app.get('/recipes', function(req, res){
	con.query('SELECT * from recipedb.recipedb', function(error, results, fields){
		if(error) throw error
		// return res.send({ error: false, data: results, message: 'All recipe datas'});
		return res.send({ data: results });
	});
});

app.get('/favourites', function(req, res){
	con.query('SELECT * from recipedb.user_fav', function(error, results, fields){
		if(error) throw error
		// return res.send({ error: false, data: results, message: 'All recipe datas'});
		return res.send({ favourite: results });
	});
});

// User -- Login 
app.post('/api/login', function(req, res){
	console.log(req.body);
	let credentials = req.body
	if(credentials.emailAddr && credentials.password){
		// const sql = 'SELECT * FROM recipedb.user_login WHERE email= "credentails.emailAddr"';
		const sql = 'SELECT * FROM recipedb.user_login WHERE email = ? AND password = ? ';


		const sqlQuery = 'SELECT * FROM user_login';
		con.query(sqlQuery, function(error, results){
			if(error) throw error;
			var user  = results;
		})
		
		con.query(sql,  [req.body.emailAddr, req.body.password], function(error, results, fields){
			console.log(results)
			if(results.length > 0){
				for(var i=0; i< results.length; i++){
					if(results[i].password == credentials.password){
						// req.session.id = results[i].id;
						var userData = results[i];
						console.log(userData, results[i].id);
						// return res.send({error: false, data: results, message: "User found in data base"})
						return res.send({results})

					}
					else{
						res.send("Invalid Password");
					}
				}
			}
			else{
				res.send("Invalid Email address");
			}
		})
	}
	else{
		return res.send({error: true, message: 'Please enter proper credentails'})

	}
})

// Add New Item
app.post('/addRecipe', function(req, res){
	console.log(req.body);
	// let obj = {recipeName: "Puttu", description: "something about puttu", ingredients: "data"}
	// let data = req.body	
	let data = []
	data = req.body	
	if(!data){
		return res.send({error: 'true', message: 'Please add recipe'});
	}
	var sql = "INSERT INTO recipedb.recipedb (recipeName, description, ingredients) VALUES ? ";
	var values = [
			[data.recipeName, data.description, "some"]
		]
	con.query(sql,[values] ,function(error, results, fields){
		if(error) throw error;
		return res.send({error: 'false', data: results, message: 'New Recipe added successfully'});
	});
});

// Update the recipe Item
app.put('/api/updateid', function(req, res){
	console.log(req.body);
	let recipeId = req.body.id
	let recipeObj = req.body
	updatedData = [recipeObj.recipeName, recipeObj.description, "dummu obj","imageurl"]
	console.log(recipeId);
	if(!recipeId || !recipeObj){
		return res.status(400).send({error: true, message: "Please provide an recipe and recipe Id"})
	}
	//  var sql = "UPDATE recipedb.recipedb SET recipeName, description = ? WHERE id = ?"
	var sql = "UPDATE recipedb.recipedb SET recipedb.recipeName = ?, recipedb.description = ? WHERE id = ?"
	 con.query(sql, [recipeObj.recipeName, recipeObj.description, recipeId], function(error, results, fields){
		if(error) throw error;
		return res.send({error: false, data: results, message: "Recipe updated successfully!!!"})
	 });
	// if(!updatedData){	
	// 	return res.send({error: 'true', message: 'Update failed'})
	// }
})

// Get recipe by ID

app.post('/api/id', function(req, res){
	let recipeObj = req.params
	// let id = req.body.id
	let id = req.params.id
	console.log(id, req.params.id)
	if(!id || !recipeObj){
		return res.status(400).send({error: true, message: "Please provide an recipe and recipe Id"})
	}
	var sql = "SELECT * FROM recipedb.recipedb WHERE id = ?"
	con.query(sql, req.params.id, function(error, results, fields){
		console.log(req, res)
		if(error) throw error;
		return res.send({error: false, data: results, message: "Recipe object recieved"})
	})
})

// Adding favourites

app.post('/api/addFavourite', function(req, res){
	let favObj = req.body
	console.log(req.body)
	if(!favObj){
		return res.status(400).send({error: true, message: "Required ids not found!"})		
	}
	var sql = "INSERT INTO recipedb.user_fav(user_id, fav_id) VALUES ? ";
	var values = [
		[favObj.userId, favObj.favId]
	]
	con.query(sql, [values], function(error, results){
		if(error) throw error;
		return res.send({error: false, data: results, message: "Favourites added successfully !!"})
	})
})

// Delete from favourite

app.delete("/api/deleteById", function(req, res){
	let userid = req.query.userId;
	let favid = req.query.favId
	console.log(res, req.params);
	// if(!userid || !favid){
	// 	return res.send(400).send({error: true, })
	// }
	con.query("DELETE FROM recipedb.user_fav WHERE user_id = ? AND fav_id = ?", [userid, favid],function(error, results){
		if(error) throw error;
		return res.send({error: false,message: "Favourite removed successfully"});		
	})
})

// set port to listen

const server = http.createServer(app);
server.listen(8080);
console.debug('Server listening on port 8080');

// app.listen(8080, function(){
//	console.log('Node app is running in port 8080');
// });

module.exports = app;
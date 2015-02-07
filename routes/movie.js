var express = require('express');
var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Catetory = require('../models/catetory');
var router = express.Router();


// movie detail page
router.get('/movie/:id',function(req,res){
    var id = req.params.id;
    if(id){
        Movie.findById(id,function(err,movie){
        	if(err){
        		console.error(err);
        		return;
        	}
            Comment.findAllByMoiveId(id,function(err,comments){
                //console.log('comments')
                //console.log(comments)
                res.render('detail',{
                    title:'电影详细信息',
                    movie:movie,
                    comments:comments
                })
            })
        });

    }
});

// admin page
router.get('/admin/movie',signinRequired,adminRequired,function(req,res){
    Catetory.findAllCatetory(function(err,catetories){
        res.render('admin',{
            title:'后台录入页面',
            movie:{
                title:'',
                doctor:'',
                country:'',
                year:'',
                poster:'',
                flash:'',
                summary:'',
                language:''
            },
            catetories:catetories
        });
    })
    
});

// admin update
router.get('/admin/update/:id',signinRequired,adminRequired,function(req,res){
    var id = req.params.id;
    if(id){
    	Movie.findById(id,function(err,movie){
        	if(err){
        		console.error(err);
        		return;
        	}
            Catetory.findAllCatetory(function(err,catetories){
                res.render('admin',{
                    title:'后台更新电影',
                    movie:movie,
                    catetories:catetories
                })
            })
        	
        })
    }
});

// admin post movie
router.post('/admin/movie/new',signinRequired,adminRequired,function(req,res){
    var movieObj = req.body;
    if(movieObj.catetory == '其他'){
        movieObj.catetory = movieObj.otherCatetory;
    }
    var id = movieObj._id;
    var _movie = {};

   if(id != 'undefined'){
        for(var i in movieObj){
            if(i != "_id"){
                _movie[i] = movieObj[i];
            }
        }
        var oldCatetory = req.body.oldCatetory;
        var updateMovie = new Movie(_movie);
        updateMovie.update(id,function(err,movie){
            if(err){
                console.error(err);
                return;
            }
            Catetory.removeMovie(oldCatetory,id,function(err,catetory){
                if(err){
                    console.error(err);
                    return;
                }
                Catetory.save(movie,function(err,catetory){
                    Catetory.saveCatetory(movieObj.catetory,function(err,catetory){
                        if(err){
                            return console.error(err);
                        }
                        console.log('new catetory:'+movie.catetory);
                        console.log("Update success");
                        res.redirect("/movie/"+id);
                    })
                })
            })
        });
    }else{
        _movie = {
            doctor:movieObj.doctor,
            title:movieObj.title,
            country:movieObj.country,
            language:movieObj.language,
            catetory:movieObj.catetory,
            year:movieObj.year,
            poster:movieObj.poster,
            summary:movieObj.summary,
            flash:movieObj.flash
        }
        var newMovie = new Movie(_movie);
        newMovie.insert(function(err,movie){
            if(err){
                console.error(err);
                return;
            }
            Catetory.save(movie,function(err,catetory){
                Catetory.saveCatetory(movieObj.catetory,function(err,catetory){
                    if(err){
                        return console.error(err);
                    }
                    console.log("Insert success.New data's id is "+movie._id);
                    res.redirect('/movie/'+movie._id);
                })
            })
        });    
    }
});

// list page
router.get('/admin/list',signinRequired,adminRequired,function(req,res){
    Movie.findAll(function(err,doc){
        if(err){
            console.error(err);
            return;
        }
        res.render('list',{
            title:'Movie List',
            movies:doc
        });
    })
});

// list delete movie
router.post('/admin/list',signinRequired,adminRequired,function(req,res){
    var id = req.query.id;
    if(id){
        Movie.deleteById(id,function(err,doc){
            if(err){
                console.error(err);
                return;
            }
            if(doc){
                console.log("Remove success");
                res.send({success:true,msg:"删除成功"})
            }else{
                console.log("No matched data");
                res.send({success:false,msg:"删除失败:电影不存在"})
            }
        });
    }
})
//需要用户登录
function signinRequired(req,res,next){
    var user = req.session.user;
    if(!user){
        return res.redirect('/signin');
    }
    next();
} 
// 需要管理员权限
function adminRequired(req,res,next){
    var user = req.session.user;
    if(!user.role || user.role <= 10){
        return res.redirect('/signin');
    }
    next();
}


module.exports = router;











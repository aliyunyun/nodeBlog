var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/posts/', router);
};

router.get('/', function (req, res, next) {

  var condition = {published: true};
  if(req.query.keyword){
    console.log("keyword: " + req.query.keyword);
    condition.title = new RegExp(req.query.keyword.trim(), 'i');
    condition.content = new RegExp(req.query.keyword.trim(), 'i');
  }

  Post.find(condition)
    .sort('-created')
    .populate('author')
    .populate('category')
    .exec(function (err, posts) {

     //return res.jsonp(posts);  // 调试技巧，直接返回全部的post

      var queryPage = req.query.page ;
      if(!queryPage){
        queryPage = 1;
      }

      var pageNum = Math.abs(parseInt(queryPage, 10));
      var pageSize = 10;

      var totalCount = posts.length;
      var pageCount = Math.ceil(totalCount / pageSize);

      if(pageNum > pageCount){
        pageNum =  pageCount;
      }

      res.render('blog/index', {
        title: '所有文字',
        posts: posts.slice((pageNum-1)*pageSize, pageNum * pageSize),
        pageNum: pageNum,
        pageCount: pageCount,
        pretty:true,
      });


      // if (err) return next(err);
      // res.render('blog/index', {
      //   title: 'Generator-Express MVC home',
      //   posts: posts
      // });
  });
});


router.get('/category/:name', function (req, res, next) {

  var name = req.params.name;
  console.log("category name: " + name);

  Category.findOne({name: req.params.name}).exec(function(err, category){


    if(err){
        console.log("cannot find catefory" + req.params.name);
    }

    Post.find({published: true, category:category})
      .sort('created')
      .populate('author')
      .populate('category')
      .exec(function (err, posts) {
        console.log('req: ' + posts );
        //return res.jsonp(posts);  // 调试技巧，直接返回全部的post

        var pageNum = Math.abs(parseInt(1, 10));
        var pageSize = 10;

        var totalCount = posts.length;
        var pageCount = Math.ceil(totalCount / pageSize);

        if(pageNum > pageCount){
          pageNum =  pageCount;
        }

        res.render('blog/category', {
          title:'分类数据',
          posts: posts,
          pretty:true,
          category:category
        });

      });

  });

});

router.get('/view/:id', function (req, res, next) {

    if(!req.params.id){
        return next(new Error('no post id provided'));
    }
    // 尝试解析 seo 搜索引擎优化
    var conditions = {};
    try{
        conditions._id = mongoose.Types.ObjectId(req.params.id);
    }catch(err){
        conditions.slug = req.params.id;
    }

    Post.findOne(conditions)
      .populate('category')
      .populate('author')
      .exec(function(err, post){
        if(err){
          return next(err);
        }

        res.render('blog/view',{
          title:'文章详情',
          post:post
        });
      });
});



router.get('/favorite/:id', function (req, res, next) {
  if(!req.params.id){
    return next(new Error('no post id provided'));
  }
  console.log('receive favourite')
  // 尝试解析 seo 搜索引擎优化
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function(err, post){
      if(err){
        return next(err);
      }


      post.meta.favorite = post.meta.favorite ? post.meta.favorite + 1 : 1;
      post.markModified('meta');

      console.log("favorite: " + post.meta.favorite);

      post.save(function(err, post){
        res.render('blog/view',{
          title:'文章详情',
          post:post
        });
      });

    });
});

router.post('/comment/:id', function (req, res, next) {
  if(!req.body.email){
    return  next(new Error('no email proviede for commenter'));
  }

  if(!req.body.content){
    return  next(new Error('no content proviede for commenter'));
  }

  if(!req.params.id){
    return next(new Error('no post id provided'));
  }
  console.log('receive comment')
  // 尝试解析 seo 搜索引擎优化
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function(err, post){
      if(err){
        return next(err);
      }

      var comment = {
        email:req.body.email,
        content:req.body.content,
        created: new Date()
      }

      post.comments.unshift(comment);
      post.markModified('comments');

      console.log("comment: " + JSON.stringify(comment));

      post.save(function(err, post){
        req.flash('info',"评论添加成功");
        console.log("info 评论添加成功");
        res.redirect('/posts/view/'+post.slug);
      });

    });
});



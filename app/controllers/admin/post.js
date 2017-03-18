var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  pinyin = require('pinyin'),
  slug = require('slug'),
  Post = mongoose.model('Post'),
  User = mongoose.model('User'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/admin/posts/', router);
};

router.get('/', function (req, res, next) {

    // sort
    var sortby = req.query.sortby ? req.query.sortby : "created";
    var sortDir = req.query.sortdir ? req.query.sortdir : "desc";


    var sortConticion = {};
    sortConticion[sortby] = sortDir

    // condition
    User.find({}, function(err,author){
      var condition = {};

      if(req.query.category){
        condition.category = req.query.category.trim();
      }

      if(req.query.author){
        condition.author = req.query.author.trim();
      }

      if(req.query.keyword){
        console.log("keyword: " + req.query.keyword);
        condition.title = new RegExp(req.query.keyword.trim(), 'i');
        condition.content = new RegExp(req.query.keyword.trim(), 'i');
      }

      //condition
      Post.find(condition)
        .sort(sortConticion)
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

          res.render('admin/posts/index', {
            title: '所有文字',
            posts: posts.slice((pageNum-1)*pageSize, pageNum * pageSize),
            pageNum: pageNum,
            pageCount: pageCount,
            sortDir: sortDir,
            sortby:sortby,
            pretty:true,
            filter:{
              category:  condition["category"] || "",
              author:  condition["author"] ||"",
              keyword: condition["keyword"] || "",
            }
          });

        });
    });


});


router.post('/edit/:id',findPostById,  function (req, res, next) {

      var post = req.post;

      req.checkBody('title', '文章标题不能为空').notEmpty();
      req.checkBody('category', '文章分类不能为空').notEmpty();
      req.checkBody('content', '文章内容不能为空').notEmpty();
      var errors = req.validationErrors();
      if(errors){
        return res.render('admin/posts/add',{
          action: '/admin/posts/edit/' + req.params.id,
          errors: errors,
          post:{
            title:req.body.title,
            category: req.body.category,
            content: req.body.content,
          }
        });
      }

      var title = req.body.title.trim();
      var category = req.body.category.trim();
      var content = req.body.content;

      var py = pinyin(title,{
        style: pinyin.STYLE_NORMAL, // 设置拼音风格
        heteronym: false
      }).map(function(item){

        return item[0];
      }).join(" ");  // 可以带音调哦

      post.title = title;
      post.category = category;
      post.content = content;
      post.slug = slug(py)

      post.save(function(err, posts){
        if(err){
          req.flash('error', '文章编辑失败');
          res.render('admin/posts/add' ,{
            action: '/admin/posts/edit/' + post._id,
            errors: error,
            post:{
              title:req.body.title,
              category: req.body.category,
              content: req.body.content,
            }
          });
        }else {
          req.flash('info', '文章编辑成功');
          res.redirect('/admin/posts');
        }
      });

});

router.get('/edit/:id',findPostById,  function (req, res, next) {

      res.render('admin/posts/add',{
        action: '/admin/posts/edit/' + req.post._id,
        title:'文章详情',
        post:req.post
      });
});

router.get('/add', function (req, res, next) {
  res.render('admin/posts/add', {
    pretty:true,
    post:{
      category:{ _id:''}
    }
  });
});

router.post('/add', function (req, res, next) {

  req.checkBody('title', '文章标题不能为空').notEmpty();
  req.checkBody('category', '文章分类不能为空').notEmpty();
  req.checkBody('content', '文章内容不能为空').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    return res.render('admin/posts/add',{
      errors: errors,
      post:{
        title:req.body.title,
        category: req.body.category,
        content: req.body.content,
      }
    });
  }

  var title = req.body.title.trim();
  var category = req.body.category.trim();
  var content = req.body.content;

  console.log("添加的内容： "+ content);
  User.findOne({},function (err, author) {
    if(err){
      return next(err);
    }

    var py = pinyin(title,{
      style: pinyin.STYLE_NORMAL, // 设置拼音风格
      heteronym: false
    }).map(function(item){

        return item[0];
    }).join(" ");  // 可以带音调哦



    var post = new Post({
        title:title,
        category:category,
        content:content,
        author:author,
        meta:{favorite:0},
        comments:[],
        created: new Date(),
        slug:slug(py),
        published:true,
        post:{}

    });

    post.save(function(error, post1){
      if(error){
        req.flash('error', '文章保存失败');
        res.redirect('/admin/posts/add',{
          action: '/admin/posts/add',
          errors: error,
          post:{
            title:req.body.title,
            category: req.body.category,
            content: req.body.content,
          }
        });
      }else {
        req.flash('info', '文章保存成功');
        res.redirect('/admin/posts/');
      }

    });
  });


});


router.get('/delete/:id', function (req, res, next) {

  if(!req.params.id){
    return next(new Error('no post id provided'));
  }

  Post.remove({_id: req.params.id}).exec(function(err, reowRemoved){
      if(err){
        req.flash('error','删除文章失败');
        return next();
      };

      if(reowRemoved){
        req.flash('success','删除文章成功');
      }else{
        req.flash('error','删除文章失败');
      }

    res.redirect('/admin/posts/');
  })
});


function findPostById(req, res, next){
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

      if(!post){
        return next(new Error("post not found"));
      }

      req.post = post;
      next();
    });
}

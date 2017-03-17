var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  slug = require('slug'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/admin/category/', router);
};

router.get('/', function (req, res, next) {

  Category.find({})
    .exec(function (err, categories) {

      var queryPage = req.query.page ;
      if(!queryPage){
        queryPage = 1;
      }

      var pageNum = Math.abs(parseInt(queryPage, 10));
      var pageSize = 10;

      var totalCount = categories.length;
      var pageCount = Math.ceil(totalCount / pageSize);

      if(pageNum > pageCount){
        pageNum =  pageCount;
      }

      res.render('admin/category/index', {
        title: '所有文字',
        categories: categories.slice((pageNum-1)*pageSize, pageNum * pageSize),
        pageNum: pageNum,
        pageCount: pageCount,
        pretty:true,
      });

    });
});



router.get('/add', function (req, res, next) {

  res.render('admin/category/add', {
    action: '/admin/category/add',
    category:{},
    pretty:true,
  });

});

router.post('/add', function (req, res, next) {

  var title = req.body.name;
  var category = new Category({
    name:title,
    category:slug(title),
    created: new Date(),
  });

  category.save(function (err, category) {
    if(err){
      req.flash('error', '分类保存失败');
      res.redirect('admin/category/add',{
        action: '/admin/category/add',
        errors: error,
        post:category
      });
    }else {
      req.flash('info', '分类保存成功');
      res.redirect('/admin/category/');
    }
  });


});

router.get('/edit/:id', findCategoryById, function (req, res, next) {

  res.render('admin/category/add',{
    action: '/admin/category/edit/' + req.category.id,
    category:req.category
  });

});

router.post('/edit/:id',findCategoryById, function (req, res, next) {

  var category = req.category;

  var title =  req.body.name;
  category.name = title;
  category.category = slug(title);

  category.save(function (err, category) {
    if(err){
      req.flash('error', '分类编辑失败');
      res.render('admin/category/add' ,{
        action: '/admin/category/edit/' + category._id,
        errors: error,
        category: category
      });
    }else {
      req.flash('info', '分类编辑成功');
      res.redirect('/admin/category');
    }
  });

});


router.get('/delete/:id', function (req, res, next) {

  if(!req.params.id){
    return next(new Error('no post id provided'));
  }

  Category.remove({_id: req.params.id}).exec(function(err, reowRemoved){
    if(err){
      req.flash('error','删除分类失败');
      return next();
    };

    if(reowRemoved){
      req.flash('success','删除分类成功');
    }else{
      req.flash('error','删除分类失败');
    }

    res.redirect('/admin/category/');
  })
});


function  findCategoryById(req, res, next) {
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

  Category.findOne(conditions)
    .exec(function(err, category){
      if(err){
        return next(err);
      }

      if(!category){
        return next(new Error("post not found"));
      }

      req.category = category;
      next();
    });

}

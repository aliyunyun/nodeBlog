
$(document).ready(function () {

  console.log("document ready");
  //admin add ckeditor
  if(typeof CKEDITOR !== "undefined"){
    CKEDITOR.replace( 'js-post-content' );
  }

  // list
  var ndCategory = $('#js-category');
  var ndAuthor = $('#js-author');

  $('#js-filter-submit').on('click', function () {
    var query = queryString.parse(location.search);
    var category = ndCategory.val();
    var author = ndAuthor.val();

    console.log("query: " + query);

    if (category) {
      query.category = category
    } else {
      delete query.category;
    }

    if (author) {
      query.author = author
    } else {
      delete query.author;
    }

    console.log(queryString.stringify(query));
    // 迫使页面跳转
    window.location.url = window.location.origin + window.location.pathname + queryString.stringify(query);

  });
});

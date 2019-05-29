let router = require('express').Router();
let mongoose = require('mongoose');
let Article = mongoose.model('Article');
let User = mongoose.model('User');
var auth = require('../auth');

router.param('article', function(req, res, next, slug) {
    Article.findOne({ slug: slug})
      //.populate('author')
      .then(function (article) {
        if (!article) { return res.sendStatus(404); }
  
        req.article = article;
  
        return next();
      }).catch(next);
  });

router.get('/:article', auth.required, function (req, res, next) {

    Promise.all([
        User.findById(req.payload.id),
        req.article.execPopulate()
    ]).then(function (results) {
        let user = results[0];
        let article = results[1];
        let download = false;
        user.purchases.forEach(o => {
            if(o.article.equals(article._id)){
                if(!o.downloads){
                    o.downloads = 0;
                }
                /*if(o.downloads >= 5){
                    throw new Error('LLego al máximo de descargas. Envíe un mail para resolver el problema.');
                }*/
                o.downloads++;
                downloads = o.downloads;
                download = true;
            }
        });
        user.save();
        if(download){
            res.download(__dirname + '../../../books/' + article.path, article.path);
            return;
        }
        res.status(400).json({error: 'Tiene que comprar el libro para poder descargarlo.'});
    }).catch(next);
});


module.exports = router;
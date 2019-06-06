let router = require('express').Router();
let { mpConfigure } = require('../../config');
let mongoose = require('mongoose');
let Article = mongoose.model('Article');
let User = mongoose.model('User');
var auth = require('../auth');
const mp = require('mercadopago');
const uuidv1 = require('uuid/v1');

router.post('/payment', auth.required, (req, res, next) => {
    Promise.all([
        User.findById(req.payload.id),
        Article.findOne({slug:req.body.slug}),
        mpConfigure()
    ]).then(function (results) {
        let user = results[0];
        let article = results[1];
        let preference = {
            items: [
                {
                    id: article._id,
                    title: article.title,
                    picture_url: article.image,
                    quantity: 1,
                    currency_id: 'ARS',
                    unit_price: article.value
                }
            ],
            payer: {
                email: user.email,
            },
            back_urls:{
                success: 'https://ventalibrosdigitales.herokuapp.com/#/mp/payment/success',
                failure: 'https://ventalibrosdigitales.herokuapp.com/#/mp/payment/failure'
            },
            auto_return: 'approved',
            external_reference: uuidv1(),
            payment_methods:{
                excluded_payment_types:[{id: 'ticket'},{id: 'atm'}]
            }
        };
        mp.preferences.create(preference)
            .then(preference => {
                console.log(JSON.stringify(preference.body));
                return res.json({point: preference.response.init_point})
            })
            .catch(next);

        if(!user.purchases){
            user.purchases = [];
        }
        user.purchases.push( {
            article: article,
            mpReference: preference.external_reference
        });
        user.save();

    }).catch(next);
});

router.post('/payment/callback', auth.required, async (req, res, next) => {
    User.findById(req.payload.id).exec().then(user => {
        user.purchases.forEach(e => {
            if(e.mpReference === req.body.external_reference){
                e.mpStatus = req.body.collection_status;
            }
        });
        user.save();
        return res.json({status:'OK'});
    }).catch(next);
});



module.exports = router;
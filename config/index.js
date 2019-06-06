const mp = require('mercadopago');


let mpConfigure = async () => {
  if(process.env.NODE_ENV === 'production'){
    /*await mp.configure({
      client_id: '6001940557687898',
      client_secret: 'MMyXQ6goIUXHhTD2U6zbBMoK9MEOr6d2'
    });*/
    await mp.configure({
      access_token: 'APP_USR-6001940557687898-051014-d2fdf96a8996a7568f38c90292dff66e-19291091'
  });
  }else{
    try{
      await mp.configure({
          sandbox: true,
          access_token: 'TEST-1381080099338534-102711-a2b4aa24fff70b262cd8da91c5fe7898__LA_LB__-19291091'
      });
    }catch(e){
      console.log('Error al obtener el accesstoken de Mercadopago', e);
    }

  }
};

module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  mpConfigure
};

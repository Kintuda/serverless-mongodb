'use strict'

let atlas_connection_uri
let cachedDb = null
const MongoClient = require('mongodb').MongoClient
// const pg = require('pg')
// let client = null
const exchangeData = (event, context, callback) => {
  console.log(process.env.MONGODB_URI);
  let uri = process.env.MONGODB_URI
  if (atlas_connection_uri != null) {
    processEvent(event, context, callback)
  }
  else {
    atlas_connection_uri = uri
    processEvent(event, context, callback)
  }
}
const connectToPostgres = (uri)=>{
  // if(client === null) return client = new pg.Psentool(process.env.PG_URI)
  // return client
}

const connectToDatabase = (uri) => {
  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    return Promise.resolve(cachedDb)
  }
  const dbName = process.env.MONGODB_DB
  return MongoClient.connect(process.env.DB)
    .then(client => { cachedDb = client.db(dbName); return cachedDb })
}

const processEvent = (event, context, callback) => {
  let arrayRetorno = []
  connectToDatabase(atlas_connection_uri)
    .then(db => queryDatabase(db, event))
    .then(result => {
      if (!result) callback(null, 'Nenhum dado encontrado com o protocolo')
      return result
    })
    .then((notificacao) => {
      let { notifications } = notificacao
      notifications.map(notification => {
        let arrayRetorno = []
        let objeto = {}
        objeto['sent'] = false
        if(notification.sent){
          objeto['enviado'] = true
          objeto['dataEnvio'] = notification.sentAt
        }

        if (notification.erro) {
          objeto['enviado'] = false
          objeto['erro']= notification.erro
        }
        arrayRetorno.push(objeto)
        return arrayRetorno
      })
    })
    .then((objeto)=>{
      connectToPostgres(process.env.PG_URI)
        .then(client => insertResult(client,event,objecto)
        .then(result=>callback(null)
    })
    .catch(err => {
      console.log(`Erro ao conectar no realizar query. Erro:`);
      callback(err)
    })
}

const insertResult = (client,event,objeto)=>{
  let { protocol } = JSON.parse(event.body)
  let sql = 
  `
    UPDATE notificacoes_historico 
      SET situacao = PROCESSADO,dados = $1, 
  `
  let params = [objeto.dados]
  client.query(sql,params,(err,result)=>{
    console.log(result);
  })

}
const queryDatabase = (db, event) => {
  let { protocol } = JSON.parse(event.body)
  console.log(protocol);
  return db.collection(process.env.MONGODB_COLLECTION).findOne({ protocol })
    .then(result => { console.log(result);return result })
    .catch(err => { return err })
}

module.exports = {
  exchangeData
}
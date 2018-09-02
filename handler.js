'use strict'

let atlas_connection_uri
let cachedDb = null
const MongoClient = require('mongodb').MongoClient
const pg = require('pg')
const exchangeData = (event, context, callback) => {
  let uri = process.env.MONGODB_URI
  if (atlas_connection_uri != null) {
    processEvent(event, context,callback)
  }
  else {
    atlas_connection_uri = uri
    processEvent(event, context, callback)
  }
}

const connectToDatabase = (uri) => {

  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    return Promise.resolve(cachedDb)
  }
  const dbName = process.env.MONGODB_DB
  return MongoClient.connect(uri)
    .then(client => { cachedDb = client.db(dbName); return cachedDb })
}

const processEvent = (event, context, callback) => {
  let arrayRetorno = []
  connectToDatabase(atlas_connection_uri)
    .then(db => queryDatabase(db, event))
    .then(result => {
      if(!result) callback(null, 'Nenhum dado encontrado com o protocolo')
      return result
    })
    .then((notificacao)=>{
      let { notifications } = notificacao
      notifications.map(notification=>{
        let objeto = {}
        objeto['sent'] = false
        if(notification.send){
          objeto['sent'] = true
        }
        arrayRetorno.push(objeto)
      })
    })
    .then((objeto)=>{
      
    })
    .catch(err => {
      console.log(`Erro ao conectar no realizar query. Erro:`);
      callback(err)
    })
}

function queryDatabase(db, event) {
  let jsonContents = JSON.parse(JSON.stringify(event))
  let protocolo
  if (event.body !== null && event.body !== undefined && event.body.protocolo !==undefined) {
    protocolo = event.body.protocol
  }

  return db.collection(process.env.MONGODB_COLLECTION).findOne({protocol: protocolo})
    .then(result => { return result })
    .catch(err => { return err })
}

module.exports = {
  exchangeData
}
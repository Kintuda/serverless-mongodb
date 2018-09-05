'use strict'

let atlas_connection_uri
let cachedDb = null
const MongoClient = require('mongodb').MongoClient
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
      if (!result) callback(null, 'No data found')
      return result
    })
    .catch(err => {
      console.log(`Error queryng mongoDB. Error:${err.message}`);
      callback(err)
    })
}

const queryDatabase = (db, event) => {
  let { data } = JSON.parse(event.body)
  return db.collection(process.env.MONGODB_COLLECTION).findOne({ data })
    .then(result => { return result })
    .catch(err => { return err })
}

module.exports = {
  exchangeData
}
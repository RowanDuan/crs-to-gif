// const { logger } = require('../util/loggingUtil')
// const logger = {}
//
// function handle(handler, options) {
//   return (req, res) => {
//     const startTs = new Date().getTime()
//     handler(req, res)
//       .then((response) => {
//         if (!options || !options.ignoreResponse) {
//           res.json(response)
//         }
//         return undefined // explicitly return undefined, to make sure the final `then` works fine
//       })
//       .catch((err) => {
//         res.status(500).send(err)
//         return err
//       })
//       .then((err) => {
//         let loggingHit = ""
//         let account = ""
//         if (options && options.loggingHit) {
//           loggingHit = options.loggingHit(req)
//         }
//         if (req.payload && req.payload.account) {
//           account = req.payload.account
//         }
//
//         const cost = new Date().getTime() - startTs
//         if (err) {
//           logger.error(
//             `${account} ${req.method} ${req.url} ${loggingHit} FAILED [${cost} ms]. ${err.stack}`
//           )
//         } else {
//           logger.info(
//             `${account} ${req.method} ${req.url} ${loggingHit} DONE [${cost} ms]`
//           )
//         }
//       })
//       .catch((err) => {
//         logger.error(`Error should not happened: ${err.stack}`)
//       })
//   }
// }
//
// exports.post = function (router, path, handler, options) {
//   router.post(path, handle(handler, options))
// }
//
// exports.get = function (router, path, handler, options) {
//   router.get(path, handle(handler, options))
// }

/**
 *  Created by qqm on 2019-03-22
 */
// 'use strict'
// const { getLogger } = require('rr-node-core')
// const { timeout } = require('../../grpc/grpcCommon')
// const logger = getLogger('baseGrpc')
// const _ = require('lodash')
//
// class BaseService {
//   constructor(grpcService) {
//     this.grpcService = grpcService
//   }
//
//   makeGrpcCall(serviceFn, transformedRequest) {
//     return new Promise((resolve, reject) => {
//       try {
//         this.grpcService[`${ _.trim(serviceFn) }`](transformedRequest, timeout(5), (err, response) => {
//           if (err) {
//             reject(err)
//           } else {
//             resolve(response)
//           }
//         })
//       } catch (e) {
//         logger.error(`${ JSON.stringify(this.grpcService) } - ${ serviceFn } ${ e.message }`)
//         return {
//           status: 500, message: e.message
//         }
//       }
//     })
//   }
// }
//
// module.exports = BaseService

// import axios from "axios";
//
// const nop = () => {}
//
// export default {
//   ajaxGet: function(url, onSuccess, onError) {
//     return this.ajaxDo({
//       method: 'GET',
//       url: url
//     }, onSuccess, onError)
//   },
//
//   ajaxPost: function(url, payload, onSuccess, onError) {
//     return this.ajaxDo({
//       method: 'POST',
//       url: url,
//       data: payload
//     }, onSuccess, onError)
//   },
//
//   ajaxDo: function(axiosOptions, onSuccess, onError) {
//     if(onSuccess === undefined) {
//       onSuccess = nop
//     }
//     if(onError === undefined) {
//       onError = nop
//     }
//     return axios(axiosOptions).then(onSuccess).catch(onError)
//   }
// }

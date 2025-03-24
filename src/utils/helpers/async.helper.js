import _ from 'lodash'
import assert from 'assert'
// import {Student} from '@/models'
// const crypto = require('crypto')

export function isAsyncFunction(v) {
    return _.isFunction(v) && v.constructor && v.constructor.name === 'AsyncFunction'
}

export function asyncHandler(fn) {
    assert(isAsyncFunction(fn), new TypeError('"fn" is required and must be an async function.'))
    return function asyncUtilWrap(...args) {
        const fnReturn = fn(...args)
        const next = args[args.length - 1]
        return Promise.resolve(fnReturn).catch(next)
    }
}

// export async function generateUniqueCodeStudent(length) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
//     let result = 'JE'
//
//     for (let i = 0; i < length; i++) {
//         const randomIndex = crypto.randomInt(0, characters.length)
//         result += characters[randomIndex]
//     }
//
//     const studentCode = await Student.findOne({code: result, deleted: false})
//     if (studentCode) {
//         return generateUniqueCodeStudent(length)
//     }
//
//     return result
// }

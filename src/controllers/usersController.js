
import jwt from 'jsonwebtoken'
import usersService from '../services/usersService'
import request from '../utils/request'
import helper from '../utils/helper'
import md5 from '../utils/crypto'
import { logger } from '../../config/logger.config'

class usersController {
  static getJwtInfo(ctx) {
    return jwt.verify(ctx.headers.authorization.split(' ')[1], ctx.request.header.publicKey);
  }

  /**
  * 登录接口，没有被jwt拦截
  * 登录成功返回加签的token信息
  */
  static async login(ctx) {
    logger.error('login', 'response:', process.env.NODE_ENV)
    let params = ctx.request.body || ctx.request.query
    let username = params.username
    let password = params.password
    if (username && password) {
      try {
        let data = await usersService.getUserPassword(username)
        // base64转码
        password = new Buffer.from(password, 'base64').toString()
        if (data[0] && data[0].password === md5(password)) {
          let userInfo = {
            username,
            role: data[0].role
          }
          let token = jwt.sign(userInfo, ctx.request.header.publicKey, { expiresIn: '2h' })
          let sqlStatus = await usersService.setUserToken(username, token)
          logger.info('login', 'sqlStatus:', sqlStatus)
          ctx.session.userInfo = userInfo
          helper.responseFormat(ctx, 200, '登录成功', { token })
          logger.info('login', 'response:', token)
        } else {
          helper.responseFormat(ctx, 410, '用户名或者密码错误')
          logger.error('login', 'response:', '用户名或者密码错误')
        }
      } catch (err) {
        helper.responseFormat(ctx, 412, '用户信息查询失败', err)
        logger.error('login', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 416, '查询参数缺失或为空')
      logger.error('login', 'params:', params)
    }
  }

  /**
  * 登出接口，没有被jwt拦截
  */
 static async logout(ctx) {
  if (ctx.headers.authorization) {
    try {
      let token = ctx.headers.authorization.split(' ')[1]
      let info = new Buffer.from(token, 'base64').toString()
      let data = await usersService.setUserToken(info.username, '')
      helper.responseFormat(ctx, 200, '登出成功', data)
      logger.info('logout', 'response:', data)
    } catch (err) {
      helper.responseFormat(ctx, 412, '登出失败', err)
      logger.error('logout', 'response:', err)
    }
  } else {
    helper.responseFormat(ctx, 416, '查询参数缺失或为空')
    logger.error('logout', 'response:', '查询参数缺失或为空')
  }
}

  /**
   * 获取指定用户信息接口。
   * 如果没有获得授信将会被jwt拦截，优先访问以上的login接口完成授信操作
   */
  static async getUserInfo(ctx) {
    console.log('session', ctx.session.userInfo)
    if (ctx.headers.authorization) {
      try {
        let jwtInfo = usersController.getJwtInfo(ctx);
        let data = await usersService.getUserInfo(jwtInfo.username)
        helper.responseFormat(ctx, 200, '查询成功', data)
        logger.info('user/info', 'response:', data)
      } catch (err) {
        helper.responseFormat(ctx, 412, '查询失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 416, '查询参数缺失或为空')
      logger.error('user/info', 'response:', '查询参数缺失或为空')
    }
  }

  /**
   * 获取所有用户信息接口。（指定权限才能）
   */
  static async getUserList(ctx) {
    if (ctx.headers.authorization) {
      try {
        let jwtInfo = usersController.getJwtInfo(ctx)
        let data = [];
        if (jwtInfo.role === 'admin') {
          data = await usersService.getUserList()
        }
        helper.responseFormat(ctx, 200, '查询成功', data)
        logger.info('user/info', 'response:', data)
      } catch (err) {
        helper.responseFormat(ctx, 412, '查询失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 416, '查询参数缺失或为空')
      logger.error('user/info', 'response:', '查询参数缺失或为空')
    }
  }

  /**
   * 添加用户验证
   */
  static async validateUser(ctx) {
    let params = Object.assign({}, ctx.request.query, ctx.request.body)
    let jwtInfo = usersController.getJwtInfo(ctx)
    if (jwtInfo.role === 'admin') {
      try {
        let data = await usersService.getUserInfo(params.username)
        helper.responseFormat(ctx, 200, '查询成功', data.length ? false : true)
        logger.info('user/info', 'response:', data.length ? false : true)
      } catch (err) {
        helper.responseFormat(ctx, 412, '查询失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 403, '当前用户没有管理员权限')
      logger.error('user/info', 'response:', '当前用户没有管理员权限')
    }
  }

  /**
   * 添加用户数据
   */
  static async addUser(ctx) {
    let params = Object.assign({}, ctx.request.query, ctx.request.body)
    let jwtInfo = usersController.getJwtInfo(ctx)
    if (jwtInfo.role === 'admin') {
      try {
        let data = await usersService.addUser(params.username, params.role, params.tellphone)
        helper.responseFormat(ctx, 200, '查询成功', data.length ? false : true)
        logger.info('user/info', 'response:', data.length ? false : true)
      } catch (err) {
        helper.responseFormat(ctx, 412, '查询失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 403, '当前用户没有管理员权限')
      logger.error('user/info', 'response:', '当前用户没有管理员权限')
    }
  }

  /**
   * 编辑用户数据
   */
  static async editUser(ctx) {
    let params = Object.assign({}, ctx.request.query, ctx.request.body)
    let jwtInfo = usersController.getJwtInfo(ctx)
    if (jwtInfo.role === 'admin') {
      try {
        let data = await usersService.editUser(params.username, params.role, params.tellphone)
        helper.responseFormat(ctx, 200, '编辑成功', data.affectedRows ? true : false)
        logger.info('user/info', 'response:', data.affectedRows ? true : false)
      } catch (err) {
        helper.responseFormat(ctx, 412, '编辑失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 403, '当前用户没有管理员权限')
      logger.error('user/info', 'response:', '当前用户没有管理员权限')
    }
  }

  /**
   * 删除用户数据
   */
  static async deleteUser(ctx) {
    let params = Object.assign({}, ctx.request.query, ctx.request.body)
    let jwtInfo = usersController.getJwtInfo(ctx)
    if (jwtInfo.role === 'admin') {
      try {
        let data = await usersService.deleteUser(params.username)
        helper.responseFormat(ctx, 200, '删除成功', data.affectedRows ? true : false)
        logger.info('user/info', 'response:', data.affectedRows ? true : false)
      } catch (err) {
        helper.responseFormat(ctx, 412, '删除失败', err)
        logger.error('user/info', 'response:', err)
      }
    } else {
      helper.responseFormat(ctx, 403, '当前用户没有管理员权限')
      logger.error('user/info', 'response:', '当前用户没有管理员权限')
    }
  }

  /**
   * 从远端请求数据
   * request中有proxy设置
   */
  static async getRemoteData(ctx) {
    const options = {
      method: 'GET',
      path: '/simpleWeather/query'
    }
    let data = await request(options, { city: '苏州', key: '2343423' })
    helper.responseFormat(ctx, 200, '查询成功', data)
  }

  /**
   * 从本地读取数据，读取方式采取异步读取
   */
  static async readFiles(ctx) {
    var path = require('path')
    let filepath = path.join(__dirname, '../files/test.json')
    let data = await helper.asyncReadFile(filepath)
    helper.responseFormat(ctx, 200, '查询成功', JSON.parse(data))
  }
}

export default usersController
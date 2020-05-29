import koaRouter from 'koa-router'
import usersController from '../controllers/usersController'

const router = koaRouter()
/**
 * 接口路径加前缀，如访问时使用 http://localhost:80/user/info
 */
// router.prefix('/users')

router.post('/login', usersController.login)

router.post('/logout', usersController.logout)

router.get('/user/info', usersController.getUserInfo)

router.get('/user/list', usersController.getUserList)

router.post('/user/validate', usersController.validateUser)

router.post('/user/add', usersController.addUser)

router.post('/user/edit', usersController.editUser)

router.post('/user/delete', usersController.deleteUser)

router.get('/getRemoteData', usersController.getRemoteData)

router.get('/readFiles', usersController.readFiles)

export default router

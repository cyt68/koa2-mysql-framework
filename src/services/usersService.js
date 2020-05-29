import sqlHelper from '../utils/sqlHelper.js'

class usersService extends sqlHelper {
    
    async getUserPassword(username) {
        return await this.query('select password, role from users where binary username = ? and isDeleted = 0', username)
    }
    
    async getUserInfo(username) {
        return await this.query('select username, role from users where binary username = ?', username)
    }

    async setUserToken(username, token) {
        return await this.query('update users set token = ? where binary username = ?', [token, username])
    }

    async getUserList() {
        return await this.query('select username, role, tellphone from users where isDeleted = 0')
    }

    async addUser(username, role, tellphone) {
        return await this.query('insert into users (username, role, tellphone) values (?, ?, ?)', [username, role, tellphone])
    }

    async editUser(username, role, tellphone) {
        return await this.query('update users set username = ?, role = ?, tellphone = ? where username = ?', [username, role, tellphone, username])
    }

    async deleteUser(username) {
        return await this.query('update users set isDeleted = 1 where username = ?', username)
    }
}

export default new usersService()
import { userService } from '../services/index.js'

export const userController = {
  async registerUser(req, res) {
    try {
      const result = await userService.register(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async loginUser(req, res) {
    try {
      const result = await userService.login(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async adminLogin(req, res) {
    try {
      const result = userService.adminLogin(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },
}

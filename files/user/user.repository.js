const { User } = require("./user.model")
class UserRepository {
  static async create(payload) {
    return await User.create(payload)
  }

  static async findUserWithParams(userPayload, select) {
    return await User.find({ ...userPayload }).select(select)
  }

  static async findSingleUserWithParams(userPayload, select) {
    const user = await User.findOne({ ...userPayload }).select(select)

    return user
  }

  static async validateUser(userPayload) {
    return User.exists({ ...userPayload })
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { UserRepository }

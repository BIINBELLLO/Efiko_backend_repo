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

  static async findAllUsersParams(userPayload) {
    const { limit, skip, sort, search, ...restOfPayload } = userPayload

    let query = {}

    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
        ],
      }
    }

    let {
      currentSkip,
      currentLimit,
    } = (page, limit) => {
      let currentPage = page * 1 || 1
      let currentLimit = limit * 1 || 10
      let currentSkip = (currentPage - 1) * currentLimit
      return { currentSkip, currentLimit }
    }

    const user = await User.find({ ...restOfPayload, ...query })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return user
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { UserRepository }

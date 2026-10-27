const model = require('../models');


module.exports = async ({ userId }) => {
    const user = await model.findById({ userId });
    if (!user) throw { status: 404, message: 'User not found' };
    
    return { id: user._id, name: user.name, email: user.email };
}

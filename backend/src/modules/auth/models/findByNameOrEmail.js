const {getDb} = require("../../../db/mongo");

module.exports = async ({name, email}) => {
    const db = getDb();
    const filter = {
        $or: [
            {name},
            {email},
        ],
    };

    return db.collection("users").findOne(filter);
};

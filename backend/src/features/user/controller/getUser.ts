import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';

export default catchAsync(async (req, res) => {
    const userId = req.user!.id;

    const user = await services.getUserById({ userId });

    res.json(user);
});

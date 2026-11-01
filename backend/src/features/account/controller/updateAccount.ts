import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';

export default catchAsync(async (req, res) => {
    const userId = req.user!.id;
    const changes = req.body;

    const result = await services.updateAccount({ userId, changes });

    res.json(result);
});

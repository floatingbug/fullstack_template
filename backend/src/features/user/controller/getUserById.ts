import catchAsync from '../../../utils/catchAsync.js';
import service from '../services/index.js';

export default catchAsync(async (req, res) => {
    const userId = req.params.id as string;

    const result = await service.getUserById({ userId });

    return res.json(result);
});

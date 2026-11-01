import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';

export default catchAsync(async (req, res) => {
    const token = req.query.token as string | undefined;

    const result = await services.confirmEmailChange({ token });

    res.json(result);
});

const AsyncHandler = (requestedFunction) => async (req, res, next) => {

    try {
        return await requestedFunction(req, res, next);
    } catch (err) {
        err.statusCode = err.code || 500;
        next(err);
    }
}
export { AsyncHandler }
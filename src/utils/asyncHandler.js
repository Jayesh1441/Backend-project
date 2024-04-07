// using promises 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next))
        .then(() => next())
        .catch((error) => {
          console.log('Error: ', error);
          next(error); // Pass error to Express error handling middleware
        });
    };
  };
  
  export { asyncHandler };
  





// const asyncHandler = (fun) => async(req, res, next) => {
//     try {
//         await fun(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500)
//         .json({
//             error: error.message || 'Unexpected Error',
//             success: false
//          });
//     }
// }
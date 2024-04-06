// using promises 
const asyncHandler = (requestHandler) =>{
    
}





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
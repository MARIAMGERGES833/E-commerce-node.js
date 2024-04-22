
import Review from '../../../DB/Models/review.model'

//=============================post review============
export const createOne =  async (req, res, next) => {
  const newDoc = await Review.create(req.body);
      res.status(201).json({ data: newDoc });
}


//=============================update review============
export const updateOne =  async (req, res, next) => {
  const document = await Review.findByIdAndUpdate(req.query.id, req.body, {
          new: true,
        });
    
        if (!document) {
            return next(new Error('Review not founded', { cause: 404 }))
        }
        // Trigger "save" event when update document
        document.save();
        res.status(200).json({ data: document });
}




//=============================get review============
export const getOne =  async (req, res, next) => {
  const { id } = req.query;
  // 1) Build query
  let query = Review.findById(id);

  // 2) Execute query
  const document = await query;

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
}








  //====================delete review
  export const deleteOne = async (req, res, next) => {
    const { id } = req.query;
    const document = await Review.findByIdAndDelete(id);
  
    if (!document) {
   
      return next(new Error('Review not founded', { cause: 404 }))
    }
  
    // Trigger "remove" event when update document
    document.remove();
    res.status(204).send();
  }
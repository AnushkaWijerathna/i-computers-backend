import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct } from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.get("/",getAllProducts)

productRouter.post("/",createProduct)

productRouter.get("/:productID",getProductByID)

//"/",":"  passe ena parameter eka product id eka wenwa...ee pID ekta equal eka delete krnwa
productRouter.delete("/:productID",deleteProduct)

productRouter.put("/:productID",updateProduct)



export default productRouter
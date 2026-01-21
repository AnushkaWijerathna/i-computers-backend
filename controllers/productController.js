import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req,res) {

    //Only an admin is supposed to create a product
    if (!isAdmin(req)) {
         res.status(403).json({
                message : "Forbidden"
        })

        return
    }

    const product = new Product(req.body)

    product.save().then(
        () => {
            res.json({
                message : "Product created successfully"
            })
        }
    ).catch(
        (error) => {
            res.status(500).json({
              error : error.message
            })
        }
    )
}

//Product reading, available to both customers and admins
export async function getAllProducts(req,res) {
    try {
        //if Admin issues the request, all products must be shown
    //if Customer issues the request, only the available products must be shown
    if (isAdmin(req)) {

       /* Product.find().then(
            
            (products) => {
                res.json(products)
            }
        ).catch(

            (error) => {
                res.status(500).json({
                    message : "Error while fetching products",
                    error : error.message
                })
            }
        )   */

        const products = await Product.find();
        res.json(products)

    }
    else{
       
            const products = await Product.find({isAvailability:true})
            res.json(products)

        }
    }catch (error) {
            res.status(500).json({
                     message : "Error while fetching products",
                     error : error.message
        })
    }
}

export async function deleteProduct(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only admins can delete products"
      });
    }
  



    //Get the productID from the request parameters... req.params.productID → for URL parameters (/:productID) and 
    //req.body.productID → for JSON body data (sent in POST/PUT requests)
    const productID = req.params.productID

    //Moongoose model ekata kiynwa oyage collection eken ekak delete krnna (mongoose model eken thma collection ekai backend ekai connect wenne)
    //ewala thiyena productID ekata samana ID ekk DB eke thiynwda balanne mongoose model eka use krla...ehema thibboth delete krnw
    await Product.deleteOne({productID : productID})
    res.json({
        message : "Product deleted successfully"
    })

    } catch (error) {
          res.status(500).json({
                     message : "Error while fetching products",
                     error : error.message
        })
    }
}

export async function updateProduct(req,res) {

    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message : "Only admins can update products"
            });          
        }

    const productID = req.params.productID

    //Delete eke una dema thama but update weddi watenna one wisthara tika req.body eke dala thiynwa
    await Product.updateOne({productID : productID},req.body)
    res.json({ 
        message : "Product updated successfully"
    })  

    } catch (error) {
         res.status(500).json({
                     message : "Error while fetching products",
                     error : error.message
        })
    }
   
}

//get product details using only the product ID
export async function getProductByID(req,res) {

    try {
        const productID = req.params.productID

        const product = await Product.findOne({productID : productID})
        if (product == null) {
            return res.status(404).json({
                message : "NO products found"
            })      
        } else {
            res.json(product)
        }

    } catch (error) {
         res.status(500).json({
            message : "Error while fetching products",
            error : error.message
        })
    }
} 
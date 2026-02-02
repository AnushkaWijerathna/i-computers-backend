import Order from "../models/Order.js";
import Product from "../models/Product.js"
import { isAdmin } from "./userController.js";

export async function createOrder(req,res) {

    if (req.user == null) {
        res.status(404).json({
            message : "Unauthorized"
        })
        return
    }

    try {

        // Ensure items payload is valid (minimal defensive check)
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ message: "No items provided for the order" });
        }

        //Find the latest order,(sanyen date eken sort krama enne parana ekta multma therfore use -1 to invert)
        const latestOrder = await Order.findOne().sort({date : -1})

        //If no latest orders then Default orderId;
        let orderID = "ORD000001"

        //if there is a latest order, then generate a OrderID for the new order
        if(latestOrder !== null){
            
            //Already available order
            let latestOrderID = latestOrder.orderID // --> "ORD000012"
            let latestOrderNumberString = latestOrderID.replace("ORD","")// -->"000012"
            let latestOrderNumber = parseInt(latestOrderNumberString) // -->"12"

            //new order
            let newOrderNum = latestOrderNumber+1 //"13"
            let newOrderNumberString = newOrderNum.toString().padStart(6,"0") //--> "000013"

            //Changing the "orderID"
            orderID = "ORD"+newOrderNumberString
        }

        //Validating order (Order mongoose object eka hadapu wdhta ee piliwelata data tika hadagnnwa)
        const items = []
        let total = 0

        for (let i = 0; i < req.body.items.length; i++) {
           
            const product = await Product.findOne({productID : req.body.items[i].productID})

            if (product == null) {
                    return res.status(404).json({
                        message : `Product with ID ${req.body.items[i].productID} not found`
                })
            }

            items.push({
                productID:product.productID,
                name : product.name,
                price:product.price,
                quantity:req.body.items[i].quantity,
                image: product.images[0]
            })

            total += product.price * req.body.items[i].quantity
        }

        let name =  req.body.name

        if (req.body.name == null) {
            
            name = req.user.firstname + " " + req.user.lastname
        }

        // Minimal phone handling to avoid ReferenceError
        let phone = req.body.phone || "";

        //Creating a new order

        const newOrder =new Order({
            orderID: orderID,
            email: req.user.email,
            name : name,
            address: req.body.address,
            total : total,
            phone:phone,
            items: items
        })
        await newOrder.save()

        //Updating stock
        // for (let j = 0; j < items.length; j++) {

        //     await Product.updateOne(
        //         {productID: items[j].productID},
        //         {$inc:{stock:items[j].quantity}}
        //     )         
        // }

        return res.json({
            message:"Order placed successfully",
            orderID:orderID
        })

    } catch (error) {
        return res.status(500).json({
            message:"Error placing order",
            error:error.message
        })
    }
} 


export async function getOrders(req,res) {
    
    if (req.user == null) {
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    if (!isAdmin(req)) {
        const orders = await Order.find().sort({date:-1})
        res.json(orders)

    }else{
        const orders = await Order.find({email:req.user.email}).sort({date:-1})
        res.json(orders)

    }
}
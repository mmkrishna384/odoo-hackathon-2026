const express=require("express");

const router=express.Router();


const {
addExpense,
getExpenses,
deleteExpense
}=require("../controllers/expenseController");



router.get("/",getExpenses);

router.post("/",addExpense);

router.delete("/:id",deleteExpense);



module.exports=router;
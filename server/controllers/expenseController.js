let expenses=[];


// Add expense

exports.addExpense=(req,res)=>{

    const expense={
        id:Date.now(),
        ...req.body
    };


    expenses.push(expense);


    res.status(201).json(expense);

};



// Get expenses

exports.getExpenses=(req,res)=>{

    res.json(expenses);

};



// Delete expense

exports.deleteExpense=(req,res)=>{

    const id=Number(req.params.id);


    expenses =
    expenses.filter(
        e=>e.id!==id
    );


    res.json({
        message:"Expense deleted"
    });

};
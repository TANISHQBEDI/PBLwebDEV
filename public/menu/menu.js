// var item= document.querySelector(".item")
let button= document.querySelector(".addCart")
button.addEventListener('click',()=>{
    let item=req.body.item;
    con.query('SELECT productid FROM products', (err, result, fields) => {
        if (err) throw err;
        console.log(result)
        con.query('ADD INTO cart',(item));
    })
})
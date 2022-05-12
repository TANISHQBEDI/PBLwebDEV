var enter_cart = document.querySelector(".entercart")
enter_cart.addEventListener('addcart', (event) => {
    event.preventDefault()
    console.log("I am here")
    var item = document.querySelector('.item')
    console.log({
        item:item.value
    })
    $.ajax({
        url: "/menuLogIn",
        type: "POST",
        data: {
            item:item.value
        },
        success: (data) => {
            console.log(data.status)
            if (data.status) {
                window.location = "/menu/menuLoggedIn.html"
            } else {
                alert(data.message)
            }
        },
        error: () => {
            alert("Could not add to cart")
        }
    })
    console.log("testing account creation")
})

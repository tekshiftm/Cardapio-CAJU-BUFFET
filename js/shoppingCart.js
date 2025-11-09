// Getting from HTML
const showItems = document.querySelector('#showItems') // Left
// Right
const showAllItemsValue = document.querySelector('#showAllItemsValue')
const showDelivery = document.querySelector('#showDelivery')
const showDiscount = document.querySelector('#showDiscount')
const showTotal = document.querySelector('#showTotal')
const inputPromotionCode = document.querySelector('#promotionCode')
const btnAddPromotionCode = document.querySelector('#addPromotionCode')
const btnWantDelivery = document.querySelector('#wantDelivery')
const btnDontWantDelivery = document.querySelector('#dontWantDelivery')
const btnEatIn = document.querySelector('#eatIn')
const btnGenerateOrder = document.querySelector('#generateOrder')

// Get
const getCart = () => JSON.parse(localStorage.getItem('cart')) || []

// Set
const setCart = cartData => localStorage.setItem('cart', JSON.stringify(cartData))

// Items
let cart
let itemsToShow
let allItemsValue
let deliveryValue = 0
let discountValue = 0
const promotionCode = 'easteregg'

// Controle do tipo de entrega
let deliveryMethod = 'Retirada no local'

// Saudação dinâmica
const getGreeting = () => {
    const currentHour = new Date().getHours()

    if (currentHour >= 5 && currentHour < 12) return "Bom dia!"
    if (currentHour >= 12 && currentHour < 18) return "Boa tarde!"
    return "Boa noite!"
}

// Gerando carrinho
const generateCart = () => {
    const cartItems = getCart()

    cart = []
    allItemsValue = 0

    cartItems.forEach(prod => {
        const item = products.find(e => e.id === prod.id)
        item.qtd = prod.qtd

        allItemsValue += item.price * item.qtd
        cart.push(item)
    })

    return cart
}

const addItemToItemsToShow = prod => {
    const price = (prod.price * prod.qtd).toFixed(2).toString().replace('.', ',')

    itemsToShow += `
    <div class="item">
        <img src="../img/${prod.img}" alt="Imagem de um(a) ${prod.name}">
        <div>
            <p class="title">${prod.name}</p>
            <p>${prod.description}</p>
            <div class="bottom">
                <div class="counter">
                    <button onclick="remItem(${prod.id})">-</button>
                    <input type="text" value="${prod.qtd}" disabled>
                    <button onclick="addItem(${prod.id})">+</button>
                </div>
                <p class="price">R$ <span>${price}</span></p>
            </div>
        </div>
    </div>
    <hr>`
}

const addItem = id => {
    const cartItems = getCart()
    const newCartItems = []

    cartItems.forEach(item => {
        if (item.id === id) newCartItems.push({ id: item.id, qtd: item.qtd + 1 })
        else newCartItems.push({ id: item.id, qtd: item.qtd })
    })

    setCart(newCartItems)
    showAddItemNotification()
    init()
}

const remItem = id => {
    const cartItems = getCart()
    const newCartItems = []
    let itemRemoved = false

    cartItems.forEach(item => {
        if (item.id === id && item.qtd > 1)
            newCartItems.push({ id: item.id, qtd: item.qtd - 1 })
        else if (item.id === id && item.qtd <= 1)
            itemRemoved = true
        else
            newCartItems.push({ id: item.id, qtd: item.qtd })
    })

    setCart(newCartItems)
    init()

    if (itemRemoved) showItemRemovedNotification()
}

// ✅ Atualizado para 3 opções
const chooseDelivery = method => {

    // Resetando classes
    btnWantDelivery.classList.remove('active')
    btnDontWantDelivery.classList.remove('active')
    btnEatIn.classList.remove('active')

    if (method === 'delivery') {
        deliveryValue = 7.00
        deliveryMethod = 'Delivery'
        btnWantDelivery.classList.add('active')

    } else if (method === 'retirar') {
        deliveryValue = 0
        deliveryMethod = 'Retirada no local'
        btnDontWantDelivery.classList.add('active')

    } else if (method === 'salao') {
        deliveryValue = 0
        deliveryMethod = 'Refeição no Salão'
        btnEatIn.classList.add('active')
    }

    init()
}

const addDiscount = () => {
    const code = inputPromotionCode.value.trim().toLowerCase()

    if (code === promotionCode) {
        discountValue = 15
        appliedCode.showToast()
        init()
    } else showCodeNotFoundNotification()
}

const init = () => {
    const generatedCart = generateCart()
    generatedCart.length > 0 && generatedCart.sort((a, b) =>
        a.type < b.type ? -1 : a.type > b.type ? 1 : 0
    )

    itemsToShow = ''
    showItems.innerHTML = ''

    if (generatedCart.length > 0)
        generatedCart.forEach(data => addItemToItemsToShow(data))
    else
        itemsToShow = '<p>Você ainda não adicionou itens no carrinho.</p>'

    showOnPage()
}

const showOnPage = () => {
    showItems.innerHTML = itemsToShow

    const totalValue = allItemsValue + deliveryValue
    showAllItemsValue.innerHTML = 'R$ ' + allItemsValue.toFixed(2).replace('.', ',')
    showDelivery.innerHTML = '+ R$ ' + deliveryValue.toFixed(2).replace('.', ',')
    showDiscount.innerHTML = '- R$ ' + ((totalValue * discountValue) / 100).toFixed(2).replace('.', ',')
    showTotal.innerHTML = 'R$ ' + (totalValue - ((totalValue * discountValue) / 100)).toFixed(2).replace('.', ',')
}

// Fields
const inputUserName = document.querySelector('#userName')
const inputUserObservation = document.querySelector('#userObservation')

// ✅ Pedido atualizado com nova modalidade
const generateOrder = () => {
    const generatedCart = generateCart()

    if (generatedCart.length === 0) return showNoItemsInCartNotification()

    const userName = inputUserName.value.trim()
    const userObservation = inputUserObservation.value.trim()

    if (!userName) return showNameRequiredNotification()

    let message = `*Pedido de ${userName}:*\n`
    message += `${getGreeting()} Gostaria de encomendar:\n\n`

    generatedCart.forEach(item => {
        message += `- ${item.qtd}x ${item.name}\n`
    })

    if (discountValue > 0) message += `\nCupom aplicado: ${promotionCode}`

    message += `\n*Forma de entrega:* ${deliveryMethod}`

    if (userObservation)
        message += `\n\n*Observações/Adicionais:* ${userObservation}`

    message += `\n\n*Total: R$ ${(allItemsValue + deliveryValue - ((allItemsValue + deliveryValue) * discountValue / 100)).toFixed(2).replace('.', ',')}*`

    const encodedMessage = encodeURIComponent(message)

    window.open(`https://wa.me/5588999665156?text=${encodedMessage}`, '_blank')
}

const showNoItemsInCartNotification = () => {
    Toastify({
        text: "Não é possível gerar pedido sem itens.",
        duration: 1500,
        gravity: "bottom",
        position: "right",
        style: { background: "#FF7F0A" }
    }).showToast()
}

const showNameRequiredNotification = () => {
    Toastify({
        text: "Por favor, insira seu nome antes de gerar o pedido.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: { background: "#FF7F0A" }
    }).showToast()
}

// Events
btnAddPromotionCode.addEventListener('click', addDiscount)

btnWantDelivery.addEventListener('click', () => chooseDelivery('delivery'))
btnDontWantDelivery.addEventListener('click', () => chooseDelivery('retirar'))
btnEatIn.addEventListener('click', () => chooseDelivery('salao'))

btnGenerateOrder.addEventListener('click', generateOrder)

init()

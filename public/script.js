let itemsData = [];
let cart = [];

function checkShopStatus() {
    fetch('/shop-status')
        .then(r => r.json())
        .then(data => {
            if (document.getElementById('shopStatus')) {
                const statusDiv = document.getElementById('shopStatus');
                if (data.isOpen) {
                    statusDiv.innerHTML = '🟢 Shop is OPEN - Start Shopping!';
                    statusDiv.className = 'status-box status-open';
                } else {
                    statusDiv.innerHTML = '🔴 Shop is CLOSED - Come back later!';
                    statusDiv.className = 'status-box status-closed';
                }
            }
            
            if (document.getElementById('items')) {
                if (!data.isOpen) {
                    document.getElementById('shopClosedMsg').style.display = 'block';
                    document.getElementById('items').style.display = 'none';
                    document.getElementById('search').disabled = true;
                } else {
                    document.getElementById('shopClosedMsg').style.display = 'none';
                    document.getElementById('items').style.display = 'flex';
                    document.getElementById('search').disabled = false;
                    loadItemsForCustomer();
                }
            }
        });
}

function loadItemsForCustomer() {
    fetch('/items')
        .then(r => r.json())
        .then(data => {
            itemsData = data;
            displayItems(data);
        });
}

function displayItems(data) {
    let out = '';
    data.forEach(i => {
        out += `
        <div class="card">
            <h3>${i.name}</h3>
            <p>💰 Price: ₹${i.price}</p>
            <p>📦 ${i.quantity > 0 ? "In Stock (" + i.quantity + " left)" : "Out of Stock"}</p>
            ${i.quantity > 0 ? `<button onclick='addToCart(${JSON.stringify(i)})'>Add to Cart 🛒</button>` : '<button disabled style="background:#ccc">Out of Stock</button>'}
        </div>`;
    });
    
    if (document.getElementById("items"))
        document.getElementById("items").innerHTML = out || '<p>No items available</p>';
}

function addToCart(item) {
    cart.push(item);
    alert("✅ " + item.name + " added to cart!");
}

function viewCart() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    let total = 0;
    let itemsList = "";
    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        itemsList += (index + 1) + ". " + item.name + " - ₹" + item.price + "\n";
    });
    
    if (confirm("Your Cart:\n\n" + itemsList + "\nTotal: ₹" + total + "\n\nPlace order?")) {
        fetch('/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total, items: cart })
        }).then(() => {
            alert("Order placed! Total: ₹" + total);
            cart = [];
        });
    }
}

function login() {
    const username = document.getElementById('u').value;
    const password = document.getElementById('p').value;
    
    if (!username || !password) {
        alert("Please enter username and password!");
        return;
    }
    
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            document.getElementById('loginBox').style.display = 'none';
            document.getElementById('panel').style.display = 'block';
            loadItemsForAdmin();
            loadShopStatus();
        } else {
            alert("Invalid credentials! Use admin/1234");
            document.getElementById('u').value = '';
            document.getElementById('p').value = '';
        }
    });
}

function loadShopStatus() {
    fetch('/shop-status')
        .then(r => r.json())
        .then(data => {
            const btn = document.getElementById('statusBtn');
            if (data.isOpen) {
                btn.innerHTML = '🔴 Close Shop';
                btn.style.background = '#e53e3e';
            } else {
                btn.innerHTML = '🟢 Open Shop';
                btn.style.background = '#48bb78';
            }
        });
}

function toggleShopStatus() {
    fetch('/toggle-shop', {
        method: 'POST'
    }).then(() => {
        loadShopStatus();
        alert("Shop status updated!");
    });
}

function addItem() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('qty').value;
    
    if (!name || !price || !quantity) {
        alert("Please fill all fields!");
        return;
    }
    
    fetch('/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, quantity })
    }).then(() => {
        alert("Item added successfully!");
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('qty').value = '';
        loadItemsForAdmin();
    });
}

function loadItemsForAdmin() {
    fetch('/items')
        .then(r => r.json())
        .then(data => {
            let out = '';
            data.forEach(i => {
                out += `
                <div class="admin-item">
                    <span>📦 ${i.name} - ₹${i.price} - Stock: ${i.quantity}</span>
                    <div>
                        <input id="q${i.id}" type="number" placeholder="New quantity" style="width:100px">
                        <button onclick="updateItem(${i.id})">Update Stock</button>
                        <button onclick="deleteItem(${i.id})" style="background:#e53e3e">Delete</button>
                    </div>
                </div>`;
            });
            document.getElementById('list').innerHTML = out || '<p>No items found. Add some items!</p>';
        });
}

function updateItem(id) {
    const newQty = document.getElementById('q' + id).value;
    if (!newQty) {
        alert("Please enter quantity!");
        return;
    }
    
    fetch('/update-item/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
    }).then(() => {
        alert("Stock updated!");
        loadItemsForAdmin();
    });
}

function deleteItem(id) {
    if (confirm("Delete this item?")) {
        fetch('/delete-item/' + id, { method: 'DELETE' })
            .then(() => {
                alert("Item deleted!");
                loadItemsForAdmin();
            });
    }
}

if (document.getElementById('items')) {
    checkShopStatus();
}

if (document.getElementById('shopStatus')) {
    checkShopStatus();
}
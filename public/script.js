let itemsData = [];

function checkShopStatus() {
    fetch('/shop-status')
        .then(r => r.json())
        .then(data => {
            if (document.getElementById('shopStatus')) {
                const statusDiv = document.getElementById('shopStatus');
                if (data.isOpen) {
                    statusDiv.innerHTML = '🟢 Shop is OPEN';
                    statusDiv.className = 'status-box status-open';
                } else {
                    statusDiv.innerHTML = '🔴 Shop is CLOSED';
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
    data.forEach((i, index) => {
        out += `
        <div class="card" style="background: ${getColor(index)}">
            <h3>${i.name}</h3>
            <p>💰 Price: ₹${i.price}</p>
            <p>📦 Stock: ${i.quantity}</p>
        </div>`;
    });
    
    if (document.getElementById("items"))
        document.getElementById("items").innerHTML = out || '<p>No items available</p>';
}

function getColor(index) {
    const colors = [
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #ffe6b3 0%, #ffb3ba 100%)',
        'linear-gradient(135deg, #b3ffd9 0%, #b3e0ff 100%)',
        'linear-gradient(135deg, #e0b3ff 0%, #ffb3f0 100%)'
    ];
    return colors[index % colors.length];
}

// Search function
if (document.getElementById("search")) {
    window.searchItems = function() {
        let val = document.getElementById("search").value.toLowerCase();
        displayItems(itemsData.filter(i => i.name.toLowerCase().includes(val)));
    };
    
    document.getElementById("search").onkeyup = window.searchItems;
}

// ADMIN FUNCTIONS
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

// Initialize based on page
if (document.getElementById('items')) {
    checkShopStatus();
}

if (document.getElementById('shopStatus')) {
    checkShopStatus();
}
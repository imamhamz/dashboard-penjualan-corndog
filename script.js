// ==========================================
// DASHBOARD PENJUALAN CORNDOG
// SUPABASE + TRANSAKSI
// ==========================================

const SUPABASE_URL =
    "https://ihwqgxxwbrbbqqhjmoxz.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_RgEkyhJtoz0QWB10oUwA_g_Ngxpdp1q";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// VARIABEL
// ==========================================

let products = [];
let cart = [];

// FILTER PRODUK
let activeCategory = "all";
let searchKeyword = "";

// ==========================================
// SAAT HALAMAN SELESAI DIMUAT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTanggalHariIni();

        loadProducts();

        loadDashboard();
        
        loadSales();
        
        setupButtons();

        setupProductFilters();

    }
);


// ==========================================
// TANGGAL HARI INI
// ==========================================

function setTanggalHariIni() {

    const input =
        document.getElementById("saleDate");

    if (!input) return;

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    input.value = today;
}


// ==========================================
// BUTTON
// ==========================================

function setupButtons() {

    const btnTambah =
        document.getElementById(
            "btnTambahTransaksi"
        );

    const btnTutup =
        document.getElementById(
            "btnTutupForm"
        );

    const btnTambahProduk =
        document.getElementById(
            "btnTambahProduk"
        );

    const btnSimpan =
        document.getElementById(
            "btnSimpanTransaksi"
        );


    if (btnTambah) {

        btnTambah.addEventListener(
            "click",
            function () {

                const form =
                    document.getElementById(
                        "formTransaksi"
                    );

                form.classList.remove(
                    "hidden"
                );

                window.scrollTo({
                    top: form.offsetTop - 20,
                    behavior: "smooth"
                });

            }
        );

    }


    if (btnTutup) {

        btnTutup.addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "formTransaksi"
                    )
                    .classList.add(
                        "hidden"
                    );

            }
        );

    }


    if (btnTambahProduk) {

        btnTambahProduk.addEventListener(
            "click",
            addProductToCart
        );

    }


    if (btnSimpan) {

        btnSimpan.addEventListener(
            "click",
            saveTransaction
        );

    }

}


// ==========================================
// AMBIL PRODUK DARI SUPABASE
// ==========================================

async function loadProducts() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("product")
            .select("*")
            .order("id");

        if (error) {
            throw error;
        }

        products = data || [];

        displayProducts();

        populateProductSelect();

        updateTotalProduk();

    }

    catch (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );

    }

}

// ==========================================
// TAMPILKAN PRODUK DI KATALOG POS
// DENGAN FILTER + SEARCH
// ==========================================

function displayProducts() {

    const grid =
        document.getElementById("productGrid");

    if (!grid) return;


    // ======================================
    // FILTER DATA PRODUK
    // ======================================

    const keyword =
        searchKeyword
            .toLowerCase()
            .trim();


    const filteredProducts =
        products.filter(function (product) {

            // ------------------------------
            // FILTER KATEGORI
            // ------------------------------

            const productCategory =
                String(product.category || "")
                    .toLowerCase()
                    .trim();

            const categoryMatch =
                activeCategory === "all" ||
                productCategory.includes(
                    activeCategory.toLowerCase();


            // ------------------------------
            // FILTER PENCARIAN
            // ------------------------------

            const productName =
                String(product.name || "")
                    .toLowerCase();

            const searchMatch =
                keyword === "" ||
                productName.includes(keyword) ||
                productCategory.includes(keyword);


            return categoryMatch && searchMatch;

        });


    // ======================================
    // TIDAK ADA HASIL
    // ======================================

    if (filteredProducts.length === 0) {

        grid.innerHTML = `
            <div class="product-loading">
                Produk tidak ditemukan
            </div>
        `;

        return;
    }


    // ======================================
    // TAMPILKAN PRODUK
    // ======================================

    grid.innerHTML =
        filteredProducts.map(function(product) {

            return `
                <button
                    type="button"
                    class="product-card"
                    data-product-id="${product.id}"
                >

                    <div class="product-image">
                        🌭
                    </div>


                    <div class="product-card-body">

                        <div class="product-category">
                            ${product.category || "Menu"}
                        </div>


                        <div class="product-name">
                            ${product.name}
                        </div>


                        <div class="product-card-footer">

                            <strong>
                                ${formatRupiah(product.price)}
                            </strong>

                            <span class="product-add">
                                +
                            </span>

                        </div>

                    </div>

                </button>
            `;

        }).join("");


    // ======================================
    // EVENT KLIK PRODUK
    // ======================================

    grid.querySelectorAll(".product-card")
        .forEach(function(card) {

            card.addEventListener(
                "click",
                function() {

                    const productId =
                        Number(
                            card.dataset.productId
                        );


                    addProductDirect(productId);

                }
            );

        });

}

// ==========================================
// FILTER KATEGORI
// ==========================================

function setupProductFilters() {

    const categoryButtons =
        document.querySelectorAll(
            ".category-tab"
        );


    categoryButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    // --------------------------
                    // SIMPAN KATEGORI AKTIF
                    // --------------------------

                    activeCategory =
                        button.dataset.category ||
                        "all";


                    // --------------------------
                    // UBAH TOMBOL AKTIF
                    // --------------------------

                    categoryButtons.forEach(
                        function(btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    // --------------------------
                    // TAMPILKAN PRODUK
                    // --------------------------

                    displayProducts();

                }
            );

        }
    );


    // ======================================
    // SEARCH PRODUK
    // ======================================

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function() {

                searchKeyword =
                    searchInput.value;


                displayProducts();

            }
        );

    }

}

// ==========================================
// TAMBAH PRODUK LANGSUNG DARI KATALOG POS
// ==========================================

function addProductDirect(productId) {

    const product =
        products.find(function (item) {

            return Number(item.id) === Number(productId);

        });

    if (!product) {

        alert("Produk tidak ditemukan.");

        return;

    }


    const existing =
        cart.find(function (item) {

            return Number(item.product_id) === Number(productId);

        });


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            product_id: product.id,

            name: product.name,

            quantity: 1,

            unit_price: Number(product.price)

        });

    }


    renderCart();

}


// ==========================================
// TAMBAH PRODUK KE CART
// ==========================================

function addProductToCart() {

    const select =
        document.getElementById(
            "productSelect"
        );

    const quantityInput =
        document.getElementById(
            "quantity"
        );


    const productId =
        Number(select.value);

    const quantity =
        Number(quantityInput.value);


    if (!productId) {

        alert(
            "Silakan pilih produk terlebih dahulu."
        );

        return;

    }


    if (!quantity || quantity < 1) {

        alert(
            "Jumlah produk minimal 1."
        );

        return;

    }


    const product =
        products.find(function (item) {

            return Number(item.id) === productId;

        });


    if (!product) {

        alert(
            "Produk tidak ditemukan."
        );

        return;

    }


    const existing =
        cart.find(function (item) {

            return Number(item.product_id) === productId;

        });


    if (existing) {

        existing.quantity += quantity;

    } else {

        cart.push({

            product_id: product.id,

            name: product.name,

            quantity: quantity,

            unit_price: Number(product.price)

        });

    }


    renderCart();

    select.value = "";

    quantityInput.value = 1;

}


// ==========================================
// TAMPILKAN CART
// ==========================================

function renderCart() {

    const cartContainer =
        document.getElementById(
            "cartItems"
        );


    if (!cartContainer) return;


    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <p class="empty-cart">
                Belum ada produk
            </p>
        `;

        updateTransactionTotal();

        return;

    }


    cartContainer.innerHTML =
        cart.map(function (item, index) {

            const subtotal =
                item.quantity *
                item.unit_price;


            return `
                <div class="cart-item">

                    <div class="cart-item-info">

                        <strong>
                            ${item.name}
                        </strong>

                        <span>
                            ${item.quantity} ×
                            ${formatRupiah(item.unit_price)}
                            =
                            ${formatRupiah(subtotal)}
                        </span>

                    </div>

                    <button
                        class="btn-remove"
                        onclick="removeFromCart(${index})"
                    >
                        Hapus
                    </button>

                </div>
            `;

        }).join("");


    updateTransactionTotal();

}


// ==========================================
// HAPUS PRODUK DARI CART
// ==========================================

function removeFromCart(index) {

    cart.splice(index, 1);

    renderCart();

}


// ==========================================
// HITUNG TOTAL
// ==========================================

function calculateTotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                (
                    item.quantity *
                    item.unit_price
                );

        },
        0
    );

}


function updateTransactionTotal() {

    const element =
        document.getElementById(
            "transactionTotal"
        );

    if (!element) return;

    element.textContent =
        formatRupiah(
            calculateTotal()
        );

}


// ==========================================
// SIMPAN TRANSAKSI
// ==========================================

async function saveTransaction() {

    if (cart.length === 0) {

        alert(
            "Tambahkan minimal satu produk."
        );

        return;

    }


    const saleDate =
        document.getElementById(
            "saleDate"
        ).value;


    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    if (!payment) {

        alert(
            "Pilih metode pembayaran."
        );

        return;

    }


    const totalAmount =
        calculateTotal();


    try {

        // ==================================
        // SIMPAN KE SALES
        // ==================================

        const {
            data: sale,
            error: saleError
        } = await supabaseClient
            .from("sales")
            .insert({

                sale_date: saleDate,

                payment_method:
                    payment.value,

                total_amount:
                    totalAmount

            })
            .select()
            .single();


        if (saleError) {

            throw saleError;

        }


        // ==================================
        // SIAPKAN SALE ITEMS
        // ==================================

        const saleItems =
            cart.map(function (item) {

                return {

                    sale_id: sale.id,

                    product_id:
                        item.product_id,

                    quantity:
                        item.quantity,

                    unit_price:
                        item.unit_price

                };

            });


        // ==================================
        // SIMPAN SALE ITEMS
        // ==================================

        const {
            error: itemError
        } = await supabaseClient
            .from("sale_items")
            .insert(saleItems);


        if (itemError) {

            throw itemError;

        }


        // ==================================
        // BERHASIL
        // ==================================

        alert(
            "Transaksi berhasil disimpan!"
        );


        cart = [];

        renderCart();

        document.querySelectorAll(
            'input[name="payment"]'
        ).forEach(function (radio) {

            radio.checked = false;

        });


        document
            .getElementById(
                "formTransaksi"
            )
            .classList.add(
                "hidden"
            );


        await loadDashboard();

        await loadSales();


    }

    catch (error) {

        console.error(
            "Gagal menyimpan transaksi:",
            error
        );

        alert(
            "Transaksi gagal disimpan. Cek Console browser."
        );

    }

}


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        // TOTAL PRODUK

        const {
            count: totalProduk,
            error: productError
        } = await supabaseClient
            .from("product")
            .select("*", {
                count: "exact",
                head: true
            });


        if (productError) {

            throw productError;

        }


        // TOTAL TRANSAKSI

        const {
            count: totalTransaksi,
            error: salesError
        } = await supabaseClient
            .from("sales")
            .select("*", {
                count: "exact",
                head: true
            });


        if (salesError) {

            throw salesError;

        }


        // TOTAL PENJUALAN

        const {
            data: salesData,
            error: amountError
        } = await supabaseClient
            .from("sales")
            .select("total_amount");


        if (amountError) {

            throw amountError;

        }


        let totalPenjualan = 0;


        salesData.forEach(
            function (sale) {

                totalPenjualan +=
                    Number(
                        sale.total_amount
                    ) || 0;

            }
        );


        // TAMPILKAN

        document.getElementById(
            "totalProduk"
        ).textContent =
            totalProduk || 0;


        document.getElementById(
            "totalTransaksi"
        ).textContent =
            totalTransaksi || 0;


        document.getElementById(
            "totalPenjualan"
        ).textContent =
            formatRupiah(
                totalPenjualan
            );


    }

    catch (error) {

        console.error(
            "Gagal memuat dashboard:",
            error
        );

    }

}


// ==========================================
// RIWAYAT TRANSAKSI
// ==========================================
async function loadSales() {

    const table =
        document.getElementById(
            "salesTable"
        );

    if (!table) return;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("sales")
            .select(
                "id, sale_date, payment_method, total_amount"
            )
            .order(
                "id",
                {
                    ascending: false
                }
            )
            .limit(20);
        
        console.log("DATA SALES:", data);
        console.log("ERROR SALES:", error);
        
        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        Belum ada transaksi
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML =
            data.map(function (sale) {

                return `
                    <tr>

                        <td>
                            ${sale.id}
                        </td>

                        <td>
                            ${formatDate(
                                sale.sale_date
                            )}
                        </td>

                        <td>
                            ${sale.payment_method}
                        </td>

                        <td>
                            ${formatRupiah(
                                sale.total_amount
                            )}
                        </td>

                        <td>
                            <button
                                onclick="deleteTransaction(${sale.id})">
                                Hapus
                            </button>
                        </td>

                    </tr>
                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "Gagal memuat transaksi:",
            error
        );

    }

}

// ==========================================
// TOTAL PRODUK
// ==========================================

function updateTotalProduk() {

    const element =
        document.getElementById(
            "totalProduk"
        );

    if (element) {

        element.textContent =
            products.length;

    }

}


// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(value) {

    return "Rp " +
        Number(value || 0)
            .toLocaleString("id-ID");

}


// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(date) {

    if (!date) return "-";

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}
async function deleteTransaction(saleId) {

    const yakin = confirm(
        "Yakin ingin menghapus transaksi ini?"
    );

    if (!yakin) {
        return;
    }

    try {

        const { error: itemError } =
            await supabaseClient
                .from("sale_items")
                .delete()
                .eq("sale_id", saleId);

        if (itemError) {
            throw itemError;
        }

        const { error: saleError } =
            await supabaseClient
                .from("sales")
                .delete()
                .eq("id", saleId);

        if (saleError) {
            throw saleError;
        }

        alert("Transaksi berhasil dihapus.");

        await loadSales();
        await loadDashboard();

    } catch (error) {

        console.error(
            "Gagal menghapus transaksi:",
            error
        );

        alert("Transaksi gagal dihapus.");

    }
}

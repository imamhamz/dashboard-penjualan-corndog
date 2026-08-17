// ==========================================
// DASHBOARD PENJUALAN CORNDOG
// Koneksi ke Supabase
// ==========================================

// URL Supabase kamu
const SUPABASE_URL = "https://ihwgxwxbrbbqhjmozx.supabase.co";

// MASUKKAN ANON/PUBLIC KEY SUPABASE DI SINI
const SUPABASE_ANON_KEY = "sb_publishable_RgEkyhJtoz0QWB10oUwA_g_Ngxpdp1q";

// ==========================================
// Memuat library Supabase
// ==========================================

const supabaseScript = document.createElement("script");

supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload = async function () {

    const { createClient } = window.supabase;

    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    // Jalankan dashboard
    await loadDashboard(supabase);
};

document.head.appendChild(supabaseScript);


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard(supabase) {

    try {

        // --------------------------------------
        // 1. TOTAL PRODUK
        // --------------------------------------

        const { count: totalProduk, error: productError } =
            await supabase
                .from("product")
                .select("*", {
                    count: "exact",
                    head: true
                });

        if (productError) {
            throw productError;
        }


        // --------------------------------------
        // 2. TOTAL TRANSAKSI
        // --------------------------------------

        const { count: totalTransaksi, error: salesError } =
            await supabase
                .from("sales")
                .select("*", {
                    count: "exact",
                    head: true
                });

        if (salesError) {
            throw salesError;
        }


        // --------------------------------------
        // 3. TOTAL PENJUALAN
        // --------------------------------------

        const { data: salesData, error: amountError } =
            await supabase
                .from("sales")
                .select("total_amount");

        if (amountError) {
            throw amountError;
        }


        let totalPenjualan = 0;

        salesData.forEach(function (sale) {

            totalPenjualan += Number(sale.total_amount) || 0;

        });


        // --------------------------------------
        // TAMPILKAN KE DASHBOARD
        // --------------------------------------

        const produkElement =
            document.getElementById("totalProduk");

        const transaksiElement =
            document.getElementById("totalTransaksi");

        const penjualanElement =
            document.getElementById("totalPenjualan");


        if (produkElement) {
            produkElement.textContent = totalProduk || 0;
        }


        if (transaksiElement) {
            transaksiElement.textContent = totalTransaksi || 0;
        }


        if (penjualanElement) {

            penjualanElement.textContent =
                "Rp " +
                totalPenjualan.toLocaleString("id-ID");

        }


        console.log("Dashboard berhasil dimuat");

    }

    catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );

    }

}

// ==========================================
// DASHBOARD PENJUALAN CORNDOG
// Koneksi ke Supabase
// ==========================================

// URL Supabase
const SUPABASE_URL = "https://ihwgxwxbrbbqhjmozx.supabase.co";

// Publishable / Anon Key
const SUPABASE_ANON_KEY =
    "sb_publishable_RgEkyHjtoz0QWB10oUwA_g_Ngxpdp1q";


// ==========================================
// LOAD SUPABASE
// ==========================================

const supabaseScript = document.createElement("script");

supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload = async function () {

    console.log("Library Supabase berhasil dimuat");

    const { createClient } = window.supabase;

    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    console.log("Supabase berhasil terhubung");

    // Pastikan HTML sudah selesai dimuat
    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", function () {
            loadDashboard(supabase);
        });

    } else {

        loadDashboard(supabase);

    }

};

supabaseScript.onerror = function () {

    console.error(
        "Gagal memuat library Supabase"
    );

};

document.head.appendChild(supabaseScript);


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard(supabase) {

    console.log("Memuat data dashboard...");

    try {

        // ======================================
        // 1. TOTAL PRODUK
        // ======================================

        const {
            count: totalProduk,
            error: productError
        } = await supabase
            .from("product")
            .select("*", {
                count: "exact",
                head: true
            });

        if (productError) {
            throw productError;
        }


        // ======================================
        // 2. TOTAL TRANSAKSI
        // ======================================

        const {
            count: totalTransaksi,
            error: salesError
        } = await supabase
            .from("sales")
            .select("*", {
                count: "exact",
                head: true
            });

        if (salesError) {
            throw salesError;
        }


        // ======================================
        // 3. TOTAL PENJUALAN
        // ======================================

        const {
            data: salesData,
            error: amountError
        } = await supabase
            .from("sales")
            .select("total_amount");

        if (amountError) {
            throw amountError;
        }


        let totalPenjualan = 0;

        salesData.forEach(function (sale) {

            totalPenjualan +=
                Number(sale.total_amount) || 0;

        });


        // ======================================
        // 4. AMBIL ELEMENT HTML
        // ======================================

        const produkElement =
            document.getElementById("totalProduk");

        const transaksiElement =
            document.getElementById("totalTransaksi");

        const penjualanElement =
            document.getElementById("totalPenjualan");


        // ======================================
        // 5. TAMPILKAN DATA
        // ======================================

        if (produkElement) {

            produkElement.textContent =
                totalProduk || 0;

        }


        if (transaksiElement) {

            transaksiElement.textContent =
                totalTransaksi || 0;

        }


        if (penjualanElement) {

            penjualanElement.textContent =
                "Rp " +
                totalPenjualan.toLocaleString("id-ID");

        }


        console.log("================================");
        console.log("DASHBOARD BERHASIL DIMUAT");
        console.log("Total Produk:", totalProduk);
        console.log("Total Transaksi:", totalTransaksi);
        console.log("Total Penjualan:", totalPenjualan);
        console.log("================================");


    } catch (error) {

        console.error(
            "Gagal memuat dashboard:",
            error
        );

    }

}
